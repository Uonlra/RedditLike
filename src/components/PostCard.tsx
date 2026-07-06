import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { FaRegCommentAlt, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import "../styles/PostCard.css";

type EnrichedPost = Doc<"posts"> & {
  author: { username: string } | null;
  subreddit: { _id: Id<"subreddits">; name: string } | null;
  imageUrl: string | null;
};

interface PostCardProps {
  post: EnrichedPost;
  showSubreddit?: boolean;
  expandedView?: boolean;
}

interface PostHeaderProps {
  author: { username: string } | null;
  subreddit: { name: string } | null;
  showSubreddit: boolean;
  creationTime: number;
}

interface PostContentProps {
  title: string;
  body?: string;
  imageUrl?: string | null;
  expandedView: boolean;
}

const formatTimestamp = (creationTime: number) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(creationTime));
};

const PostHeader = ({
  author,
  subreddit,
  showSubreddit,
  creationTime,
}: PostHeaderProps) => {
  return (
    <div className="post-header">
      {author ? (
        <Link to={`/u/${author.username}`} className="post-author">
          u/{author.username}
        </Link>
      ) : (
        <span className="post-author">u/deleted</span>
      )}

      {showSubreddit && subreddit && (
        <>
          <span className="post-dot">-</span>
          <Link to={`/r/${subreddit.name}`} className="post-subreddit">
            r/{subreddit.name}
          </Link>
        </>
      )}
      <span className="post-dot">-</span>
      <span className="post-timestamp">{formatTimestamp(creationTime)}</span>
    </div>
  );
};

const PostContent = ({
  title,
  body,
  imageUrl,
  expandedView,
}: PostContentProps) => {
  const TitleTag = expandedView ? "h1" : "h2";

  return (
    <>
      <TitleTag className="post-title">{title}</TitleTag>
      {imageUrl && (
        <div className={`post-image-container ${expandedView ? "" : "small-img"}`}>
          <img src={imageUrl} alt="Post content" className="post-image" />
        </div>
      )}
      {body && <p className="post-body">{body}</p>}
    </>
  );
};

const PostCard = ({
  post,
  showSubreddit = false,
  expandedView = false,
}: PostCardProps) => {
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.current);
  const deletePost = useMutation(api.posts.deletePost);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const ownedByCurrentUser = currentUser?._id === post.authorId;

  const handleOpenComments = () => {
    if (!expandedView) {
      navigate(`/post/${post._id}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you would like to delete this?")) return;

    setDeleteError("");
    setIsDeleting(true);
    try {
      await deletePost({ id: post._id });
      if (expandedView) {
        navigate(post.subreddit ? `/r/${post.subreddit.name}` : "/");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className={`post-card ${expandedView ? "expanded" : ""}`}>
      <div className="post-votes" aria-label="Votes placeholder">
        <span className="vote-count total-count">0</span>
      </div>
      <div className="post-content">
        <PostHeader
          author={post.author}
          subreddit={post.subreddit}
          showSubreddit={showSubreddit}
          creationTime={post._creationTime}
        />
        <PostContent
          title={post.title}
          body={post.body}
          imageUrl={post.imageUrl}
          expandedView={expandedView}
        />
        {deleteError && <div className="post-error">{deleteError}</div>}
        <div className="post-actions">
          <button type="button" className="action-button" onClick={handleOpenComments}>
            <FaRegCommentAlt />
            <span>Comments</span>
          </button>
          {ownedByCurrentUser && (
            <button
              type="button"
              className="action-button delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete post"
            >
              <FaTrash />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;