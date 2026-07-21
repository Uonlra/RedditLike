import { usePaginatedQuery, useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";

/**
 * SubredditPage — 社区页（hero + 帖子列表 + 关于侧栏）。
 *
 * ── 知识点：双栏 grid 的 mobile-first 改写 ──
 *   原 CSS：默认 minmax(0,1fr) 336px，@media (max-width:860px) 变 1fr。
 *   迁移：grid-cols-1 lg:grid-cols-[minmax(0,1fr)_336px]
 *     - 基线单栏（手机/平板）
 *     - ≥1024px 双栏（860→1024 取舍见 Day 4 Q5）
 *   minmax(0,1fr) 防止 flex/grid 子项被长内容撑破。
 *   文档：https://tailwindcss.com/docs/grid-template-columns
 *
 * ── 知识点：order 重排侧栏 ──
 *   原 CSS：≤860 时 .subreddit-about { order: -1 }（侧栏跑到帖子上方）。
 *   迁移：order-first lg:order-none
 *     - 移动端 about 在前；大屏恢复文档顺序（帖子左、about 右）。
 *   文档：https://tailwindcss.com/docs/order
 *
 * ── 知识点：碎片断点 560/860 → sm/lg ──
 *   560px 收紧 padding/头像 → 基线小尺寸，sm: 放大。
 *   860px 双栏 → lg: 双栏。
 *
 * ── 知识点：place-items-center ──
 *   等价于 align-items + justify-items: center，头像/空态一键居中。
 *   文档：https://tailwindcss.com/docs/place-items
 *
 * ── 知识点：任意 grid 轨道 ──
 *   grid-cols-[minmax(0,1fr)_336px] 用方括号写精确轨道宽度。
 */

const formatCreatedDate = (timestamp: number) => {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
};

const pageShellClassName =
  "mx-auto w-full max-w-[1320px] px-3 pt-[61px] pb-6 sm:px-6 sm:pt-[69px] sm:pb-8";

const surfaceClassName =
  "rounded-xs border border-gray-200 bg-white";

const SubredditPage = () => {
  const { subredditName } = useParams<{ subredditName: string }>();
  const subreddit = useQuery(
    api.subreddit.get,
    subredditName ? { name: subredditName } : "skip",
  );
  const {
    results: posts,
    loadMore,
    status,
  } = usePaginatedQuery(
    api.posts.getSubredditPosts,
    subreddit ? { subredditName: subreddit.name } : "skip",
    { initialNumItems: 20 },
  );

  if (subreddit === undefined) {
    return (
      <div className={pageShellClassName}>
        <section
          className={`${surfaceClassName} mb-5 flex min-h-[132px] items-center gap-4 p-4 sm:p-6`}
        >
          <div className="size-12 shrink-0 rounded-full bg-gray-200 sm:size-16" />
          <div className="grid w-full max-w-[360px] gap-2.5">
            <span className="block h-[18px] rounded-xs bg-gray-200" />
            <span className="block h-[18px] w-[72%] rounded-xs bg-gray-200" />
          </div>
        </section>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className={pageShellClassName}>
        <section className={`${surfaceClassName} px-6 py-12 text-center`}>
          <h1 className="m-0 mb-3 text-2xl font-semibold text-gray-900">
            未找到社区
          </h1>
          <p className="m-0 text-sm text-gray-500">
            未找到社区 r/{subredditName}。
          </p>
        </section>
      </div>
    );
  }

  const description = subreddit.description?.trim() || "暂无描述。";
  const createdDate = formatCreatedDate(subreddit._creationTime);
  const postCountLabel = `${subreddit.postCount} 篇帖子`;

  return (
    <div className={pageShellClassName}>
      {/* Hero */}
      <section
        className={`${surfaceClassName} mb-5 flex min-h-[132px] items-start gap-4 p-4 sm:items-center sm:p-6`}
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-600 text-[17px] font-bold text-white sm:size-16 sm:text-[22px]">
          r/
        </div>
        <div className="min-w-0">
          <h1 className="m-0 mb-1.5 wrap-anywhere text-[22px] leading-tight font-bold text-gray-900 sm:text-[28px]">
            r/{subreddit.name}
          </h1>
          <div className="mb-2 text-[13px] font-bold text-blue-600">
            {postCountLabel}
          </div>
          <p className="m-0 max-w-[680px] wrap-anywhere text-sm leading-normal text-gray-600">
            {description}
          </p>
        </div>
      </section>

      {/* 主栏 + 侧栏：移动端单栏 about 在上，lg 双栏 */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_336px]">
        <main
          className={surfaceClassName}
          aria-label={`r/${subreddit.name} 中的帖子`}
        >
          {posts.length === 0 ? (
            <div className="grid min-h-[116px] place-items-center p-6 text-center text-gray-500">
              <p className="m-0 text-sm">还没有帖子，来发布第一篇吧。</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-3">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} showSubreddit />
              ))}
            </div>
          )}
          {status === "CanLoadMore" && (
            <button
              type="button"
              className="mx-auto my-3 block cursor-pointer rounded-full border-0 bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => loadMore(20)}
            >
              加载更多
            </button>
          )}
        </main>

        <aside
          className={`${surfaceClassName} order-first overflow-hidden lg:order-none`}
          aria-label="社区信息"
        >
          <div className="bg-blue-600 px-4 py-3 text-[13px] font-bold tracking-normal text-white uppercase">
            关于社区
          </div>
          <p className="m-0 wrap-anywhere p-4 text-sm leading-normal text-gray-900">
            {description}
          </p>
          <dl className="m-0 grid gap-3 px-4 pb-4">
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
              <dt className="m-0 text-[13px] text-gray-500">创建时间</dt>
              <dd className="m-0 text-right text-[13px] font-semibold text-gray-900">
                {createdDate}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
              <dt className="m-0 text-[13px] text-gray-500">帖子</dt>
              <dd className="m-0 text-right text-[13px] font-semibold text-gray-900">
                {postCountLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
              <dt className="m-0 text-[13px] text-gray-500">社区</dt>
              <dd className="m-0 wrap-anywhere text-right text-[13px] font-semibold text-gray-900">
                r/{subreddit.name}
              </dd>
            </div>
          </dl>
          <Link
            className="mx-4 mb-4 flex min-h-9 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white no-underline hover:bg-blue-700"
            to={`/r/${subreddit.name}/submit`}
          >
            发布帖子
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default SubredditPage;
