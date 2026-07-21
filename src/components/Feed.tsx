import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostCard from "./PostCard";

/**
 * Feed — 首页热门帖子列表。
 *
 * 知识点：max-w-* + mx-auto 居中容器
 *   max-w-[960px] 限制最大宽度；mx-auto 左右 auto margin 水平居中。
 *   这是"内容栏居中"的标准写法，替代旧 .content-container 心智。
 *
 * 知识点：flex flex-col gap-*
 *   纵向堆叠 + gap 控制子项间距，比 margin-bottom 连环更干净。
 *   posts-list 用 gap-2.5（10px），feed 外层 gap-3（12px）。
 *
 * 知识点：为什么这里没用 Day 5 的 .card
 *   原 feed-container 有 box-shadow、无 border；.card 有 border、无 shadow。
 *   视觉不完全一致 → 直接写工具类，不硬套 .card（3 次法则的反面：别为复用而扭曲语义）。
 *
 * 文档：
 *   https://tailwindcss.com/docs/max-width
 *   https://tailwindcss.com/docs/margin#adding-space-between-children （gap 替代 space-y 的场景）
 *   https://tailwindcss.com/docs/box-shadow
 */
export function Feed() {
  const topPosts = useQuery(api.leaderboard.getTopPosts, { limit: 10 });

  if (topPosts === undefined) {
    return (
      <div className="grid w-full grid-cols-1 p-2.5">
        <section className="mx-auto w-full max-w-[960px] rounded-xs bg-white p-5 text-sm text-gray-500 shadow-sm">
          正在加载热门帖子...
        </section>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 p-2.5">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-3 rounded-xs bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">热门帖子</h2>
        {topPosts.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            暂无热门帖子，发布第一篇帖子吧。
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2.5">
            {topPosts.map((post, index) => (
              <PostCard
                key={post._id}
                post={post}
                rank={index + 1}
                showSubreddit
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
