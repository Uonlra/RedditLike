import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "../lib/utils";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCommunityModal = ({
  isOpen,
  onClose,
}: CreateCommunityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createSubreddit = useMutation(api.subreddit.create);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const communityName = name.trim();
    const communityDescription = description.trim();

    if (!communityName) {
      setError("请输入社区名称。");
      return;
    }

    if (communityName.length < 3 || communityName.length > 21) {
      setError("社区名称长度需为 3 到 21 个字符。");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(communityName)) {
      setError("社区名称只能包含字母、数字和下划线。");
      return;
    }

    setIsLoading(true);
    try {
      await createSubreddit({
        name: communityName,
        description: communityDescription || undefined,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "创建社区时出错，请稍后重试。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[1000] bg-black/50"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 z-[1001] w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="m-0 text-base font-medium text-text">创建社区</h2>
          <button
            type="button"
            className="flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-2xl leading-none text-text-subtle hover:text-text"
            onClick={onClose}
            aria-label="关闭创建社区弹窗"
          >
            &times;
          </button>
        </div>

        <form className="px-4 py-6" onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-text"
            >
              名称
            </label>
            <span className="pointer-events-none absolute top-[38px] left-3 text-sm text-text-faint">
              r/
            </span>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="社区名称"
              maxLength={21}
              disabled={isLoading}
              className="input w-full pl-7 disabled:cursor-not-allowed disabled:bg-surface-2"
            />
            <p className="mt-1 text-xs text-text-subtle">
              社区名称创建后无法修改，包括大小写。
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block font-medium text-text"
            >
              描述 <span className="font-normal text-text-subtle">（可选）</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="社区描述（可选）"
              maxLength={100}
              disabled={isLoading}
              className="input min-h-[120px] w-full resize-y disabled:cursor-not-allowed disabled:bg-surface-2"
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-danger">{error}</div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="h-8 min-h-0 cursor-pointer rounded-full border border-accent bg-transparent px-4 text-sm font-bold text-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className={cn("btn-primary h-8 min-h-0 px-4 disabled:cursor-not-allowed")}
              disabled={isLoading}
            >
              {isLoading ? "创建中..." : "创建社区"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateCommunityModal;
