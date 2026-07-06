import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { FaRegCommentAlt, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import "../styles/PostCard.css";
import Comment from "./Comments";

type EnrichedPost = Doc<"posts"> & {
  author: { username: string } | null;
  subreddit: { _id: Id<"subreddits">; name: string } | null;
  imageUrl: string | null;
  commentCount: number;
};

type EnrichedComment = Doc<"comments"> & {
  author: { username: string } | null;
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

interface CommentSectionProps {
  comments: EnrichedComment[];
  onSubmit: (content: string) => void;
  signedIn: boolean;
  isSubmitting: boolean;
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

const CommentSection = ({
  comments,
  onSubmit,
  signedIn,
  isSubmitting,
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = newComment.trim();
    if (!content) return;

    onSubmit(content);
    setNewComment("");
  };

  return (
    <div className="comments-section">
      {signedIn ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="写下你的评论"
            className="comment-input"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="comment-submit"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? "Commenting..." : "Comment"}
          </button>
        </form>
      ) : (
        <p className="comment-login-hint">Sign in to leave a comment.</p>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
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
  const createComment = useMutation(api.comments.create);
  const comments = useQuery(api.comments.getPostComments, { postId: post._id });
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(expandedView);
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const ownedByCurrentUser = currentUser?._id === post.authorId;

  const handleOpenComments = () => {
    if (!expandedView) {
      navigate(`/post/${post._id}`);
      return;
    }

    setShowComments((isVisible) => !isVisible);
  };

  const handleSubmitComment = async (content: string) => {
    setCommentError("");
    setIsSubmittingComment(true);

    try {
      await createComment({ postId: post._id, body: content });
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Failed to create comment.",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("确认删除？")) return;

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
            <span>{post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}</span>
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

        {commentError && <div className="post-error">{commentError}</div>}
        {(showComments || expandedView) && (
          <CommentSection
            comments={comments ?? []}
            onSubmit={handleSubmitComment}
            signedIn={currentUser !== null && currentUser !== undefined}
            isSubmitting={isSubmittingComment}
          />
        )}
      </div>
    </article>
  );
};

export default PostCard;


