import { useQuery } from "convex/react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import PostCard from "../components/PostCard";
import "../styles/PostPage.css";

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const post = useQuery(
    api.posts.getPost,
    postId ? { id: postId as Id<"posts"> } : "skip",
  );

  if (post === undefined) {
    return (
      <div className="post-page loading">
        <div className="container">Loading...</div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="post-page loading">
        <div className="container">Post not found.</div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="container">
        <div className="page-header">
          <button type="button" onClick={() => navigate(-1)} className="back-link">
            <FaArrowLeft /> Back
          </button>
        </div>
        <PostCard post={post} showSubreddit expandedView />
      </div>
    </div>
  );
};

export default PostPage;