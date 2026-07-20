import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaImage } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "../lib/utils";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const pageShellClassName = "mx-auto max-w-[740px] px-5 pt-[69px] pb-5";

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
        <div className="card p-6">
          <h1 className="m-0 text-lg font-medium text-text">加载中...</h1>
        </div>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className={pageShellClassName}>
        <div className="card px-6 py-12 text-center">
          <h1 className="m-0 mb-3 text-2xl text-text">未找到社区</h1>
          <p className="m-0 text-text-subtle">社区 r/{subredditName} 不存在。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClassName}>
      <div className="card p-6">
        <h1 className="m-0 mb-5 text-lg font-medium text-text">
          在 r/{subreddit.name} 发布帖子
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="标题"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="input w-full p-4 text-lg font-medium"
            maxLength={300}
            disabled={isSubmitting}
          />

          <div className="rounded-md border border-border bg-surface p-4">
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-4 py-2 text-sm text-text transition-colors hover:bg-surface-3",
                isSubmitting && "pointer-events-none opacity-60",
              )}
            >
              <FaImage className="text-lg text-accent" />
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
                  className="size-full rounded-md object-contain bg-surface-2"
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
            className="input min-h-[200px] w-full resize-y"
            disabled={isSubmitting}
          />
          {error && (
            <div className="text-sm leading-snug text-danger">{error}</div>
          )}
          <div className="mt-5 flex justify-start gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/r/${subreddit.name}`)}
              className="min-h-0 cursor-pointer rounded-md border-0 bg-surface-3 px-4 py-2 font-semibold text-text transition-colors hover:bg-border-strong disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className={cn(
                "btn-primary min-h-0",
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
