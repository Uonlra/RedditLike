import { Link } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/Comment.css";

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
    <div className="comment">
      <div className="comment-header">
        {comment.author ? (
          <Link to={`/u/${comment.author.username}`} className="comment-author">
            u/{comment.author.username}
          </Link>
        ) : (
          <span className="comment-author">u/deleted</span>
        )}
        <span className="comment-dot">-</span>
        <span className="comment-timestamp">
          {new Date(comment._creationTime).toLocaleString()}
        </span>
      </div>
      <div className="comment-content">{comment.body}</div>
    </div>
  );
};

export default Comment;
