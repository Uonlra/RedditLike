import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "../styles/CreateDropdown.css";
import CreateCommunityModal from "./CreateCommunityModal";

interface CreateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      <div className="dropdown-overlay" onClick={onClose} />
      <div className="create-dropdown">
        <div className="dropdown-header">创建</div>
        <div className="dropdown-options">
          {currentSubreddit && (
            <Link
              className="dropdown-option"
              to={`/r/${encodeURIComponent(currentSubreddit)}/submit`}
              onClick={onClose}
            >
              <div className="option-icon">
                <FaPlus />
              </div>
              <div className="option-content">
                <span className="option-title">发帖</span>
                <span className="option-description">
                  发布到 r/{currentSubreddit}
                </span>
              </div>
            </Link>
          )}

          <button
            type="button"
            className="dropdown-option"
            onClick={handleCreateCommunity}
          >
            <div className="option-icon">
              <FaPlus />
            </div>
            <div className="option-content">
              <span className="option-title">社区</span>
              <span className="option-description">创建新社区</span>
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
