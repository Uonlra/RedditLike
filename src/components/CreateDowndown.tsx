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
        <div className="dropdown-header">Create</div>
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
                <span className="option-title">Post</span>
                <span className="option-description">
                  Share to r/{currentSubreddit}
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
              <span className="option-title">Community</span>
              <span className="option-description">Create a new community</span>
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
