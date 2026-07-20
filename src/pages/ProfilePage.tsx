import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const publicUser = useQuery(
    api.users.getPublicUser,
    username ? { username } : "skip",
  );
  const {
    results: posts,
    loadMore,
    status,
  } = usePaginatedQuery(
    api.posts.userPosts,
    username ? { authorUsername: username } : "skip",
    { initialNumItems: 20 },
  );

  if (!username) {
    return (
      <div className="mx-auto max-w-[1320px] px-5 pt-[69px] pb-5">
        <div className="card px-6 py-12 text-center">
          <h1 className="m-0 text-2xl text-text">未找到用户</h1>
        </div>
      </div>
    );
  }

  const postCount = publicUser?.posts ?? posts.length;

  return (
    <div className="mx-auto max-w-[1320px] px-5 pt-[69px] pb-5">
      <div className="card mb-6 p-6">
        <h1 className="m-0 text-2xl font-semibold text-text">
          u/{publicUser?.username ?? username}
        </h1>
        <div className="mt-2 text-[13px] font-semibold text-text-subtle">
          <span>{postCount} 篇帖子</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="card p-6 text-center text-text-subtle">
            <p className="m-0">还没有帖子</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} showSubreddit />
          ))
        )}
        {status === "CanLoadMore" && (
          <button
            type="button"
            className="btn-primary self-center"
            onClick={() => loadMore(20)}
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
