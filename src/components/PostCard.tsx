import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { FaRegCommentAlt, FaTrash } from "react-icons/fa";
import { TbArrowBigDown, TbArrowBigUp } from "react-icons/tb";
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

type VoteCounts = {
  total: number;
  upvotes: number;
  downvotes: number;
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

interface VoteButtonsProps {
  voteCounts: VoteCounts | undefined;
  hasUpvoted: boolean | undefined;
  hasDownvoted: boolean | undefined;
  isVoting: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
}

const formatTimestamp = (creationTime: number) => {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(creationTime));
};

const VoteButtons = ({
  voteCounts,
  hasUpvoted,
  hasDownvoted,
  isVoting,
  onUpvote,
  onDownvote,
}: VoteButtonsProps) => {
  const upvotes = voteCounts?.upvotes ?? 0;
  const downvotes = voteCounts?.downvotes ?? 0;
  const total = voteCounts?.total ?? 0;

  return (
    <div className="post-votes" aria-label="帖子投票控件">
      <span className="vote-count upvote-count">{upvotes}</span>
      <button
        type="button"
        className={`vote-button upvote-button ${hasUpvoted ? "voted" : ""}`}
        onClick={onUpvote}
        disabled={isVoting}
        aria-label={hasUpvoted ? "取消赞同" : "赞同帖子"}
      >
        <TbArrowBigUp aria-hidden="true" />
      </button>
      <span className="vote-count total-count">{total}</span>
      <span className="vote-count downvote-count">{downvotes}</span>
      <button
        type="button"
        className={`vote-button downvote-button ${hasDownvoted ? "voted" : ""}`}
        onClick={onDownvote}
        disabled={isVoting}
        aria-label={hasDownvoted ? "取消反对" : "反对帖子"}
      >
        <TbArrowBigDown aria-hidden="true" />
      </button>
    </div>
  );
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
        <span className="post-author">u/已删除</span>
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

  if (expandedView) {
    return (
      <>
        <TitleTag className="post-title">{title}</TitleTag>
        {imageUrl && (
          <div className="post-image-container">
            <img src={imageUrl} alt="帖子图片" className="post-image" />
          </div>
        )}
        {body && <p className="post-body">{body}</p>}
      </>
    );
  }

  return (
    <div className="post-summary-row">
      <div className="post-summary-text">
        <TitleTag className="post-title">{title}</TitleTag>
        {body && <p className="post-body">{body}</p>}
      </div>
      {imageUrl && (
        <div className="post-thumbnail-container">
          <img src={imageUrl} alt="帖子缩略图" className="post-thumbnail" />
        </div>
      )}
    </div>
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
            {isSubmitting ? "评论发布中..." : "评论"}
          </button>
        </form>
      ) : (
        <p className="comment-login-hint">登录后即可发表评论。</p>
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
  const toggleUpvote = useMutation(api.vote.toggleUpvote);
  const toggleDownvote = useMutation(api.vote.toggleDownvote);
  const comments = useQuery(api.comments.getPostComments, { postId: post._id });
  const voteCounts = useQuery(api.vote.getVoteCounts, { postId: post._id });
  const hasUpvoted = useQuery(api.vote.hasUpvoted, { postId: post._id });
  const hasDownvoted = useQuery(api.vote.hasDownvoted, { postId: post._id });
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(expandedView);
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const ownedByCurrentUser = currentUser?._id === post.authorId;

  const handleOpenComments = () => {
    if (!expandedView) {
      navigate(`/post/${post._id}`);
      return;
    }

    setShowComments((isVisible) => !isVisible);
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    setVoteError("");
    setIsVoting(true);

    try {
      if (voteType === "upvote") {
        await toggleUpvote({ postId: post._id });
      } else {
        await toggleDownvote({ postId: post._id });
      }
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : "投票失败，请稍后重试。");
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async (content: string) => {
    setCommentError("");
    setIsSubmittingComment(true);

    try {
      await createComment({ postId: post._id, body: content });
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "评论发布失败，请稍后重试。",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("确认要删除这篇帖子吗？")) return;

    setDeleteError("");
    setIsDeleting(true);
    try {
      await deletePost({ id: post._id });
      if (expandedView) {
        navigate(post.subreddit ? `/r/${post.subreddit.name}` : "/");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "删除帖子失败，请稍后重试。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className={`post-card ${expandedView ? "expanded" : ""}`}>
      <VoteButtons
        voteCounts={voteCounts}
        hasUpvoted={hasUpvoted}
        hasDownvoted={hasDownvoted}
        isVoting={isVoting}
        onUpvote={() => handleVote("upvote")}
        onDownvote={() => handleVote("downvote")}
      />
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
        {(deleteError || voteError) && (
          <div className="post-error">{deleteError || voteError}</div>
        )}
        <div className="post-actions">
          <button type="button" className="action-button" onClick={handleOpenComments}>
            <FaRegCommentAlt />
            <span>
              {post.commentCount} 条评论
            </span>
          </button>
          {ownedByCurrentUser && (
            <button
              type="button"
              className="action-button delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="删除帖子"
            >
              <FaTrash />
              <span>{isDeleting ? "删除中..." : "删除"}</span>
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

