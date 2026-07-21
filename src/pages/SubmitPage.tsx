import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaImage } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "../lib/utils";

/**
 * SubmitPage — 发帖表单（标题 / 图片 / 正文）。
 *
 * ── 知识点：隐藏原生 file input ──
 *   用 label 包住按钮外观，input 用 sr-only 或 hidden 藏起来。
 *   点击 label 仍会触发文件选择（原生可访问性）。
 *   文档：https://tailwindcss.com/docs/display#hiding-elements
 *
 * ── 知识点：图片预览 + absolute 关闭钮 ──
 *   容器 relative；关闭钮 absolute top-2 right-2。
 *   object-contain 保持比例，不裁切。
 *   文档：https://tailwindcss.com/docs/object-fit
 *
 * ── 知识点：max-w 按页面收窄 ──
 *   发帖页 max-w-[740px] 比 Profile 的 1320px 更窄，表单更易读。
 *   不同页面壳层宽度不同是正常的，不必抽成全局 .content-container。
 *
 * ── 知识点：cn() 处理 disabled 态 ──
 *   提交按钮在 isSubmitting 或标题为空时禁用，用 cn 叠 opacity/cursor。
 *
 * ── 知识点：响应式预览宽 ──
 *   原 CSS 固定 500×300；小屏会溢出 → max-w-full w-[500px] 自适应。
 */

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const pageShellClassName =
  "mx-auto max-w-[740px] px-5 pt-[69px] pb-5";

const SubmitPage = () => {
  const { subredditName } = useParams<{ subredditName: string }>();
  const navigate = useNavigate();
  const subreddit = useQuery(
    api.subreddit.get,
    subredditName ? { name: subredditName } : "skip",
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.image.generateUploadUrl);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("图片大小不能超过 5MB。");
      return;
    }

    setError("");
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setError("请输入标题。");
      return;
    }

    if (!subreddit) {
      setError("社区仍在加载，或该社区不存在。");
      return;
    }

    setIsSubmitting(true);
    try {
      let storageId: Id<"_storage"> | undefined;

      if (selectedImage) {
        const uploadUrl = await generateUploadUrl({});
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        if (!uploadResult.ok) {
          throw new Error("图片上传失败。");
        }

        const uploadJson = (await uploadResult.json()) as {
          storageId: Id<"_storage">;
        };
        storageId = uploadJson.storageId;
      }

      const postId = await createPost({
        title: trimmedTitle,
        body: trimmedBody || undefined,
        subredditId: subreddit._id,
        storageId,
      });
      navigate(`/post/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建帖子失败，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (subreddit === undefined) {
    return (
      <div className={pageShellClassName}>
        <div className="rounded-xs border border-gray-300 bg-white p-6">
          <h1 className="m-0 text-lg font-medium text-gray-900">加载中...</h1>
        </div>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className={pageShellClassName}>
        <div className="rounded-xs bg-white px-6 py-12 text-center shadow-sm">
          <h1 className="m-0 mb-3 text-2xl text-gray-900">未找到社区</h1>
          <p className="m-0 text-gray-500">社区 r/{subredditName} 不存在。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClassName}>
      <div className="rounded-xs border border-gray-300 bg-white p-6">
        <h1 className="m-0 mb-5 text-lg font-medium text-gray-900">
          在 r/{subreddit.name} 发布帖子
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="标题"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xs border border-gray-200 bg-white p-4 text-lg font-medium text-gray-900 transition-[border-color] duration-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none disabled:opacity-60"
            maxLength={300}
            disabled={isSubmitting}
          />

          <div className="rounded-xs border border-gray-200 bg-white p-4">
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-xs border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-200",
                isSubmitting && "pointer-events-none opacity-60",
              )}
            >
              <FaImage className="text-lg text-blue-600" />
              上传图片
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isSubmitting}
              />
            </label>
            {imagePreview && (
              <div className="relative mt-4 inline-block h-[300px] w-full max-w-[500px] overflow-hidden">
                <img
                  src={imagePreview}
                  alt="图片预览"
                  className="size-full rounded-xs object-contain bg-gray-100"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full border-0 bg-black/80 p-0 text-white transition-colors hover:bg-black disabled:opacity-60"
                  aria-label="移除图片"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                >
                  <IoMdClose />
                </button>
              </div>
            )}
          </div>

          <textarea
            placeholder="文本内容（可选）"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-[200px] w-full resize-y rounded-xs border border-gray-200 bg-white p-3 text-sm text-gray-900 transition-[border-color] duration-200 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none disabled:opacity-60"
            disabled={isSubmitting}
          />
          {error && (
            <div className="text-sm leading-snug text-orange-700">{error}</div>
          )}
          <div className="mt-5 flex justify-start gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/r/${subreddit.name}`)}
              className="cursor-pointer rounded-xs border-0 bg-gray-200 px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className={cn(
                "cursor-pointer rounded-xs border-0 bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-800",
                (isSubmitting || !title.trim()) &&
                  "cursor-not-allowed opacity-60",
              )}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "发布中..." : "发布"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;
