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

/**
 * PostCard — 最复杂组件（投票 / 摘要布局 / 评论区）。
 *
 * ── 知识点：cn() 条件类名 ──
 *   hasUpvoted && "text-[#ff4500]" 只在真值时加入类名。
 *   cn("base", condition && "extra") 是 shadcn 标准写法。
 *   文档：https://github.com/dcastil/tailwind-merge
 *
 * ── 知识点：碎片断点 700/640 → md/sm ──
 *   max-width:700px 摘要变单栏 → 基线 grid-cols-1，md:grid-cols-[minmax(0,1fr)_auto]
 *   max-width:640px 评论按钮全宽 → 基线 w-full，sm:w-auto
 *
 * ── 知识点：aspect-video ──
 *   缩略图 16:9，替代 aspect-ratio: 16/9。
 *   文档：https://tailwindcss.com/docs/aspect-ratio
 *
 * ── 知识点：min-w-0 在 flex/grid 子项 ──
 *   防止长标题撑破横向布局（默认 min-width:auto）。
 *
 * ── 知识点：expanded 变体 ──
 *   列表态 vs 详情态用 cn 叠不同字号/边框，不必拆两个组件。
 *
 * ── 知识点：全局 button 样式覆盖 ──
 *   index.css 给 button 加了边框/背景；投票/操作钮需 border-0 bg-transparent 重置。
 */

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
  "grid size-7 place-items-center rounded-xs border-0 bg-transparent p-0 text-gray-500 cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-65 [&_svg]:size-6";

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
      className="flex min-w-[44px] flex-col items-center gap-0.5 bg-gray-100 px-1.5 py-2.5"
      aria-label="帖子投票控件"
    >
      <span className="min-h-4 text-center text-xs font-bold leading-4 text-[#ff4500]">
        {upvotes}
      </span>
      <button
        type="button"
        className={cn(
          voteButtonBase,
          (hasUpvoted || false) && "text-[#ff4500]",
          "hover:text-[#ff4500]",
        )}
        onClick={onUpvote}
        disabled={isVoting}
        aria-label={hasUpvoted ? "取消赞同" : "赞同帖子"}
      >
        <TbArrowBigUp aria-hidden="true" />
      </button>
      <span className="min-h-4 text-center text-[13px] font-bold leading-4 text-gray-900">
        {total}
      </span>
      <span className="min-h-4 text-center text-xs font-bold leading-4 text-[#7193ff]">
        {downvotes}
      </span>
      <button
        type="button"
        className={cn(
          voteButtonBase,
          (hasDownvoted || false) && "text-[#7193ff]",
          "hover:text-[#7193ff]",
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
    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
      {author ? (
        <Link
          to={`/u/${author.username}`}
          className="text-gray-500 no-underline hover:underline"
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
            className="font-medium text-blue-600 no-underline hover:underline"
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
        <TitleTag className="m-0 mb-4 wrap-anywhere text-[28px] font-medium text-gray-900">
          {title}
        </TitleTag>
        {imageUrl && (
          <div className="my-4 flex justify-center overflow-hidden rounded-xs">
            <img
              src={imageUrl}
              alt="帖子图片"
              className="max-h-[512px] max-w-full object-contain"
            />
          </div>
        )}
        {body && (
          <p className="m-0 whitespace-pre-wrap wrap-anywhere text-base leading-relaxed text-gray-900">
            {body}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="grid min-h-24 grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
      <div className="min-w-0">
        <TitleTag className="m-0 mb-2.5 wrap-anywhere text-xl font-medium text-gray-900">
          {title}
        </TitleTag>
        {body && (
          <p className="m-0 whitespace-pre-wrap wrap-anywhere text-sm leading-normal text-gray-900">
            {body}
          </p>
        )}
      </div>
      {imageUrl && (
        <div className="mt-0.5 aspect-video w-full max-w-[240px] overflow-hidden rounded-xs bg-gray-100 md:w-44 md:max-w-none">
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
    <div className="mt-3 border-t border-gray-200 pt-3">
      {signedIn ? (
        <form
          className="mb-3.5 flex flex-col items-stretch gap-2 sm:items-end"
          onSubmit={handleSubmit}
        >
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="写下你的评论"
            className="min-h-[92px] w-full resize-y rounded-xs border border-gray-300 bg-white px-3 py-2.5 text-sm leading-snug text-gray-900 outline-none placeholder:text-gray-500 focus:border-blue-600 focus:shadow-[0_0_0_1px_#0079d3] disabled:cursor-not-allowed disabled:bg-gray-100"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={cn(
              "h-9 min-w-24 cursor-pointer rounded-full border-0 bg-blue-600 px-4 text-[13px] font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto",
              "w-full",
            )}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? "评论发布中..." : "评论"}
          </button>
        </form>
      ) : (
        <p className="mb-3 text-[13px] text-gray-500">登录后即可发表评论。</p>
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
        "flex w-full overflow-hidden rounded-xs border border-gray-300 bg-white",
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
          <div className="mt-2 text-[13px] leading-snug text-orange-700">
            {deleteError || voteError}
          </div>
        )}
        <div className="mt-4 flex gap-[18px] md:mt-7">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-xs border-0 bg-transparent p-2 text-xs text-gray-500 hover:bg-gray-200"
            onClick={handleOpenComments}
          >
            <FaRegCommentAlt />
            <span>{post.commentCount} 条评论</span>
          </button>
          {ownedByCurrentUser && (
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1.5 rounded-xs border-0 bg-transparent p-2 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="mt-2 text-[13px] leading-snug text-orange-700">
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
