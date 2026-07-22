import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";

/**
 * CreateCommunityModal — 创建社区弹窗。
 *
 * ── 知识点：fixed 居中弹层 ──
 *   遮罩：fixed inset-0 bg-black/50
 *   面板：fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
 *   即 top:50% + left:50% + transform:translate(-50%,-50%) 经典居中。
 *   文档：https://tailwindcss.com/docs/translate
 *
 * ── 知识点：任意透明度 bg-black/50 ──
 *   /50 = 50% alpha。v4 用 color-mix 实现，替代 rgba(0,0,0,0.5)。
 *   文档：https://tailwindcss.com/docs/background-color#changing-the-opacity
 *
 * ── 知识点：输入框前缀 r/ ──
 *   外层 relative，前缀 absolute left-3，input 用 pl-7 给前缀留空。
 *   比旧 CSS top:35px 硬编码更稳（不依赖 label 高度）。
 *
 * ── 知识点：旧 CSS 的 form { padding } 是全局选择器 ──
 *   CreateCommunityModal.css 里 `form { padding: ... }` 会污染全站 form。
 *   迁移后改为 form 上显式 className，这是 Tailwind 迁移的附带收益。
 *
 * ── 知识点：shadcn Button 首次实战 ──
 *   取消/创建/关闭按钮复用 Button 的 variant 和 size，业务层只保留必要尺寸微调。
 *   阶段四会用 shadcn Dialog 替换本组件（Esc/焦点陷阱/ARIA 内置）。
 */

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
      {/* 半透明遮罩 */}
      <div
        className="fixed inset-0 z-[1000] bg-black/50"
        onClick={onClose}
      />

      {/* 居中面板 */}
      <div className="fixed top-1/2 left-1/2 z-[1001] w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-xs bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="m-0 text-base font-medium text-gray-900">创建社区</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-2xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            onClick={onClose}
            aria-label="关闭创建社区弹窗"
          >
            &times;
          </Button>
        </div>

        <form className="px-4 py-6" onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-gray-900"
            >
              名称
            </label>
            {/* 前缀 r/：absolute 叠在 input 左侧 */}
            <span className="pointer-events-none absolute top-[38px] left-3 text-sm text-gray-500">
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
              className="input w-full pl-7 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              社区名称创建后无法修改，包括大小写。
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block font-medium text-gray-900"
            >
              描述 <span className="font-normal text-gray-500">（可选）</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="社区描述（可选）"
              maxLength={100}
              disabled={isLoading}
              className="input min-h-[120px] w-full resize-y disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-600/5 hover:text-blue-600"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              disabled={isLoading}
            >
              {isLoading ? "创建中..." : "创建社区"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateCommunityModal;
