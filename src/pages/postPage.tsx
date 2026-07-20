import { useQuery } from "convex/react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import PostCard from "../components/PostCard";

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const post = useQuery(
    api.posts.getPost,
    postId ? { id: postId as Id<"posts"> } : "skip",
  );

  if (post === undefined) {
    return (
      <div className="flex min-h-[240px] items-center justify-center pt-[69px] text-lg text-text">
        加载中...
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="flex min-h-[240px] items-center justify-center pt-[69px] text-lg text-text">
        未找到帖子。
      </div>
    );
  }

  return (
    <div className="pt-[69px]">
      <div className="mx-auto max-w-[1320px] px-5">
        <div className="mb-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex min-h-0 cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 font-inherit text-accent hover:text-accent-hover"
          >
            <FaArrowLeft /> 返回
          </button>
        </div>
        <PostCard post={post} showSubreddit expandedView />
      </div>
    </div>
  );
};

export default PostPage;
