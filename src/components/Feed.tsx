import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "./PostCard";
import "../styles/Feed.css";

export function Feed() {
  const topPosts = useQuery(api.leaderboard.getTopPosts, { limit: 10 });

  if (topPosts === undefined) {
    return (
      <div className="content-grid">
        <section className="feed-container feed-state">正在加载热门帖子...</section>
      </div>
    );
  }

  return (
    <div className="content-grid">
      <div className="feed-container">
        <h2 className="section-title">热门帖子</h2>
        {topPosts.length === 0 ? (
          <div className="feed-empty">暂无热门帖子，发布第一篇帖子吧。</div>
        ) : (
          <div className="posts-list">
            {topPosts.map((post) => (
              <PostCard key={post._id} post={post} showSubreddit />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
