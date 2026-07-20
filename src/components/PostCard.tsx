import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { FaRegCommentAlt, FaTrash } from "react-icons/fa";
import { TbArrowBigDown, TbArrowBigUp } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { cn } from "../lib/utils";
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

const voteButtonBase =
  "grid size-7 min-h-0 place-items-center rounded-xs border-0 bg-transparent p-0 text-text-faint cursor-pointer hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-65 [&_svg]:size-6";

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
    <div
      className="flex min-w-[44px] flex-col items-center gap-0.5 bg-surface-2 px-1.5 py-2.5"
      aria-label="帖子投票控件"
    >
      <span className="min-h-4 text-center text-xs font-bold leading-4 text-upvote">
        {upvotes}
      </span>
      <button
        type="button"
        className={cn(
          voteButtonBase,
          hasUpvoted && "text-upvote",
          "hover:enabled:text-upvote",
        )}
        onClick={onUpvote}
        disabled={isVoting}
        aria-label={hasUpvoted ? "取消赞同" : "赞同帖子"}
      >
        <TbArrowBigUp aria-hidden="true" />
      </button>
      <span className="min-h-4 text-center text-[13px] font-bold leading-4 text-text">
        {total}
      </span>
      <span className="min-h-4 text-center text-xs font-bold leading-4 text-downvote">
        {downvotes}
      </span>
      <button
        type="button"
        className={cn(
          voteButtonBase,
          hasDownvoted && "text-downvote",
          "hover:enabled:text-downvote",
        )}
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
    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
      {author ? (
        <Link
          to={`/u/${author.username}`}
          className="text-text-subtle no-underline hover:underline"
        >
          u/{author.username}
        </Link>
      ) : (
        <span>u/已删除</span>
      )}

      {showSubreddit && subreddit && (
        <>
          <span>-</span>
          <Link
            to={`/r/${subreddit.name}`}
            className="font-medium text-accent no-underline hover:text-accent-hover hover:underline"
          >
            r/{subreddit.name}
          </Link>
        </>
      )}
      <span>-</span>
      <span>{formatTimestamp(creationTime)}</span>
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
        <TitleTag className="m-0 mb-4 wrap-anywhere text-[28px] font-medium text-text">
          {title}
        </TitleTag>
        {imageUrl && (
          <div className="my-4 flex justify-center overflow-hidden rounded-md">
            <img
              src={imageUrl}
              alt="帖子图片"
              className="max-h-[512px] max-w-full object-contain"
            />
          </div>
        )}
        {body && (
          <p className="m-0 whitespace-pre-wrap wrap-anywhere text-base leading-relaxed text-text">
            {body}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="grid min-h-24 grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
      <div className="min-w-0">
        <TitleTag className="m-0 mb-2.5 wrap-anywhere text-xl font-medium text-text">
          {title}
        </TitleTag>
        {body && (
          <p className="m-0 whitespace-pre-wrap wrap-anywhere text-sm leading-normal text-text">
            {body}
          </p>
        )}
      </div>
      {imageUrl && (
        <div className="mt-0.5 aspect-video w-full max-w-[240px] overflow-hidden rounded-md bg-surface-2 md:w-44 md:max-w-none">
          <img
            src={imageUrl}
            alt="帖子缩略图"
            className="block size-full object-cover"
          />
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
    <div className="mt-3 border-t border-border pt-3">
      {signedIn ? (
        <form
          className="mb-3.5 flex flex-col items-stretch gap-2 sm:items-end"
          onSubmit={handleSubmit}
        >
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="写下你的评论"
            className="input min-h-[92px] w-full resize-y disabled:cursor-not-allowed disabled:bg-surface-2"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="btn-primary h-9 min-h-0 min-w-24 w-full px-4 text-[13px] sm:w-auto"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? "评论发布中..." : "评论"}
          </button>
        </form>
      ) : (
        <p className="mb-3 text-[13px] text-text-subtle">登录后即可发表评论。</p>
      )}

      <div className="flex flex-col gap-2">
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
    <article
      className={cn(
        "flex w-full overflow-hidden rounded-md border border-border bg-surface shadow-sm",
        expandedView && "rounded-none border-0 shadow-sm",
      )}
    >
      <VoteButtons
        voteCounts={voteCounts}
        hasUpvoted={hasUpvoted}
        hasDownvoted={hasDownvoted}
        isVoting={isVoting}
        onUpvote={() => handleVote("upvote")}
        onDownvote={() => handleVote("downvote")}
      />
      <div className="min-w-0 flex-1 px-[18px] pt-3.5 pb-3 text-inherit no-underline">
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
          <div className="mt-2 text-[13px] leading-snug text-danger">
            {deleteError || voteError}
          </div>
        )}
        <div className="mt-4 flex gap-[18px] md:mt-7">
          <button
            type="button"
            className="btn-ghost-accent min-h-0"
            onClick={handleOpenComments}
          >
            <FaRegCommentAlt className="mr-1.5 inline" />
            <span>{post.commentCount} 条评论</span>
          </button>
          {ownedByCurrentUser && (
            <button
              type="button"
              className="flex min-h-0 cursor-pointer items-center gap-1.5 rounded-xs border-0 bg-transparent p-2 text-xs text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="删除帖子"
            >
              <FaTrash />
              <span>{isDeleting ? "删除中..." : "删除"}</span>
            </button>
          )}
        </div>

        {commentError && (
          <div className="mt-2 text-[13px] leading-snug text-danger">
            {commentError}
          </div>
        )}
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
