import { Link } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";

interface CommentProps {
  comment: {
    _id: Id<"comments">;
    body: string;
    author: { username: string } | null;
    _creationTime: number;
  };
}

const Comment = ({ comment }: CommentProps) => {
  return (
    <div className="rounded-xs border border-border bg-surface-2 px-3 py-2.5 hover:border-border-strong">
      <div className="mb-1.5 flex flex-wrap items-center gap-1 text-xs text-text-subtle">
        {comment.author ? (
          <Link
            to={`/u/${comment.author.username}`}
            className="font-semibold text-text no-underline hover:text-accent-hover hover:underline"
          >
            u/{comment.author.username}
          </Link>
        ) : (
          <span className="font-semibold text-text">u/已删除</span>
        )}
        <span>-</span>
        <span>{new Date(comment._creationTime).toLocaleString("zh-CN")}</span>
      </div>
      <div className="m-0 whitespace-pre-wrap wrap-anywhere text-sm leading-normal text-text">
        {comment.body}
      </div>
    </div>
  );
};

export default Comment;
