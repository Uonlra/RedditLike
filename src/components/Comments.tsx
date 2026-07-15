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
    <div className="rounded-xs border border-gray-200 bg-white px-3 py-2.5 hover:border-gray-300">
      <div className="mb-1.5 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        {comment.author ? (
          <Link
            to={`/u/${comment.author.username}`}
            className="font-semibold text-gray-900 no-underline hover:text-blue-600 hover:underline"
          >
            u/{comment.author.username}
          </Link>
        ) : (
          <span className="font-semibold text-gray-900">u/已删除</span>
        )}
        <span>-</span>
        <span>{new Date(comment._creationTime).toLocaleString("zh-CN")}</span>
      </div>
      <div className="m-0 whitespace-pre-wrap wrap-anywhere text-sm leading-normal text-gray-900">
        {comment.body}
      </div>
    </div>
  );
};

export default Comment;
