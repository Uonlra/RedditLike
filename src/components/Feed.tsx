import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "./PostCard";

export function Feed() {
  const topPosts = useQuery(api.leaderboard.getTopPosts, { limit: 10 });

  if (topPosts === undefined) {
    return (
      <div className="grid w-full grid-cols-1 p-2.5">
        <section className="card mx-auto w-full max-w-[960px] p-5 text-sm text-text-subtle">
          正在加载热门帖子...
        </section>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 p-2.5">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-3">
        <h2 className="px-1 text-lg font-medium text-text">热门帖子</h2>
        {topPosts.length === 0 ? (
          <div className="card py-6 text-center text-sm text-text-subtle">
            暂无热门帖子，发布第一篇帖子吧。
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2.5">
            {topPosts.map((post) => (
              <PostCard key={post._id} post={post} showSubreddit />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
