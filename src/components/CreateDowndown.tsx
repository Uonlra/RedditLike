import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import CreateCommunityModal from "./CreateCommunityModal";

/**
 * CreateDropdown — Navbar「+」按钮下的创建菜单。
 *
 * ── 知识点：fixed overlay 拦截点击 ──
 *   fixed inset-0 = 铺满视口的透明层，z-index 高于页面、低于菜单。
 *   点空白处 → onClick={onClose} 关闭菜单（点击外部关闭模式）。
 *   文档：https://tailwindcss.com/docs/position#fixed-positioning
 *         https://tailwindcss.com/docs/top-right-bottom-left#pinning-to-all-sides
 *
 * ── 知识点：absolute top-full right-0 ──
 *   菜单相对父级 .dropdown-container(position:relative，仍在 Navbar.css) 定位。
 *   top-full = top:100% 贴在触发按钮下方；right-0 右对齐。
 *   阶段四会用 shadcn DropdownMenu 替换整套 overlay+absolute。
 *
 * ── 知识点：Link 与 button 共用同一套选项样式 ──
 *   「发帖」是路由跳转用 Link；「社区」是打开弹窗用 button。
 *   同一串 className 保证视觉一致；Link 额外 no-underline 覆盖默认链接样式。
 */

interface CreateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const optionClassName =
  "flex w-full min-h-14 cursor-pointer items-center gap-3.5 rounded-sm border-0 bg-transparent px-3 py-2 text-left text-inherit no-underline hover:bg-gray-100";

const CreateDropdown = ({ isOpen, onClose }: CreateDropdownProps) => {
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const location = useLocation();
  const subredditMatch = location.pathname.match(/^\/r\/([^/]+)(?:\/|$)/);
  const currentSubreddit = subredditMatch
    ? decodeURIComponent(subredditMatch[1])
    : null;

  if (!isOpen) return null;

  const handleCreateCommunity = () => {
    setIsCommunityModalOpen(true);
  };

  return (
    <>
      {/* 全屏透明遮罩：点外部关闭 */}
      <div className="fixed inset-0 z-[101]" onClick={onClose} />

      {/* 菜单面板：相对 Navbar 的 dropdown-container 定位 */}
      <div className="absolute top-[calc(100%+4px)] right-0 z-[102] w-[330px] rounded-sm border border-gray-200 bg-white shadow-md">
        <div className="border-b border-gray-200 px-[18px] pt-3.5 pb-3 text-[10px] font-bold tracking-normal text-gray-500 uppercase">
          创建
        </div>
        <div className="px-2 pt-2.5 pb-3">
          {currentSubreddit && (
            <Link
              className={optionClassName}
              to={`/r/${encodeURIComponent(currentSubreddit)}/submit`}
              onClick={onClose}
            >
              <div className="flex size-6 shrink-0 items-center justify-center text-gray-500 [&_svg]:size-[15px]">
                <FaPlus />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm leading-[18px] font-bold text-gray-900">
                  发帖
                </span>
                <span className="text-xs leading-4 text-gray-500">
                  发布到 r/{currentSubreddit}
                </span>
              </div>
            </Link>
          )}

          <button
            type="button"
            className={optionClassName}
            onClick={handleCreateCommunity}
          >
            <div className="flex size-6 shrink-0 items-center justify-center text-gray-500 [&_svg]:size-[15px]">
              <FaPlus />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm leading-[18px] font-bold text-gray-900">
                社区
              </span>
              <span className="text-xs leading-4 text-gray-500">
                创建新社区
              </span>
            </div>
          </button>
        </div>
      </div>

      <CreateCommunityModal
        isOpen={isCommunityModalOpen}
        onClose={() => {
          setIsCommunityModalOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default CreateDropdown;
