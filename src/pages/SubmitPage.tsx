import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaImage } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/SubmitPage.css";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

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

        const uploadJson = (await uploadResult.json()) as { storageId: Id<"_storage"> };
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
      <div className="content-container">
        <div className="submit-container">
          <h1>加载中...</h1>
        </div>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className="content-container">
        <div className="not-found">
          <h1>未找到社区</h1>
          <p>社区 r/{subredditName} 不存在。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="submit-container">
        <h1>在 r/{subreddit.name} 发布帖子</h1>
        <form className="submit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="标题"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="submit-title"
            maxLength={300}
            disabled={isSubmitting}
          />

          <div className="media-input-container">
            <label className="image-upload-label">
              <FaImage className="image-icon" />
              上传图片
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
                disabled={isSubmitting}
              />
            </label>
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="图片预览" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-button" aria-label="移除图片"
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
            className="submit-body"
            disabled={isSubmitting}
          />
          {error && <div className="submit-error">{error}</div>}
          <div className="submit-actions">
            <button
              type="button"
              onClick={() => navigate(`/r/${subreddit.name}`)}
              className="back-button"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="submit-button"
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
