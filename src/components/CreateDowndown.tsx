import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import CreateCommunityModal from "./CreateCommunityModal";

interface CreateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const optionClassName =
  "flex w-full min-h-14 cursor-pointer items-center gap-3.5 rounded-sm border-0 bg-transparent px-3 py-2 text-left text-inherit no-underline hover:bg-surface-2";

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
      <div className="fixed inset-0 z-[101]" onClick={onClose} />

      <div className="absolute top-[calc(100%+4px)] right-0 z-[102] w-[330px] rounded-md border border-border bg-surface shadow-md">
        <div className="border-b border-border px-[18px] pt-3.5 pb-3 text-[10px] font-bold tracking-normal text-text-subtle uppercase">
          创建
        </div>
        <div className="px-2 pt-2.5 pb-3">
          {currentSubreddit && (
            <Link
              className={optionClassName}
              to={`/r/${encodeURIComponent(currentSubreddit)}/submit`}
              onClick={onClose}
            >
              <div className="flex size-6 shrink-0 items-center justify-center text-text-subtle [&_svg]:size-[15px]">
                <FaPlus />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm leading-[18px] font-bold text-text">
                  发帖
                </span>
                <span className="text-xs leading-4 text-text-subtle">
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
            <div className="flex size-6 shrink-0 items-center justify-center text-text-subtle [&_svg]:size-[15px]">
              <FaPlus />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm leading-[18px] font-bold text-text">
                社区
              </span>
              <span className="text-xs leading-4 text-text-subtle">
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
