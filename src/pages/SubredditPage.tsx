import { usePaginatedQuery, useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";

const formatCreatedDate = (timestamp: number) => {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
};

const pageShellClassName =
  "mx-auto w-full max-w-[1320px] px-3 pt-[61px] pb-6 sm:px-6 sm:pt-[69px] sm:pb-8";

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
        <section className="card mb-5 flex min-h-[132px] items-center gap-4 p-4 sm:p-6">
          <div className="size-12 shrink-0 rounded-full bg-surface-3 sm:size-16" />
          <div className="grid w-full max-w-[360px] gap-2.5">
            <span className="block h-[18px] rounded-xs bg-surface-3" />
            <span className="block h-[18px] w-[72%] rounded-xs bg-surface-3" />
          </div>
        </section>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className={pageShellClassName}>
        <section className="card px-6 py-12 text-center">
          <h1 className="m-0 mb-3 text-2xl font-semibold text-text">
            未找到社区
          </h1>
          <p className="m-0 text-sm text-text-subtle">
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
      <section className="card mb-5 flex min-h-[132px] items-start gap-4 p-4 sm:items-center sm:p-6">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-[17px] font-bold text-white sm:size-16 sm:text-[22px]">
          r/
        </div>
        <div className="min-w-0">
          <h1 className="m-0 mb-1.5 wrap-anywhere text-[22px] leading-tight font-bold text-text sm:text-[28px]">
            r/{subreddit.name}
          </h1>
          <div className="mb-2 text-[13px] font-bold text-accent">
            {postCountLabel}
          </div>
          <p className="m-0 max-w-[680px] wrap-anywhere text-sm leading-normal text-text-muted">
            {description}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_336px]">
        <main className="card" aria-label={`r/${subreddit.name} 中的帖子`}>
          {posts.length === 0 ? (
            <div className="grid min-h-[116px] place-items-center p-6 text-center text-text-subtle">
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
              className="btn-primary mx-auto my-3 block"
              onClick={() => loadMore(20)}
            >
              加载更多
            </button>
          )}
        </main>

        <aside
          className="card order-first overflow-hidden lg:order-none"
          aria-label="社区信息"
        >
          <div className="bg-accent px-4 py-3 text-[13px] font-bold tracking-normal text-white uppercase">
            关于社区
          </div>
          <p className="m-0 wrap-anywhere p-4 text-sm leading-normal text-text">
            {description}
          </p>
          <dl className="m-0 grid gap-3 px-4 pb-4">
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="m-0 text-[13px] text-text-subtle">创建时间</dt>
              <dd className="m-0 text-right text-[13px] font-semibold text-text">
                {createdDate}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="m-0 text-[13px] text-text-subtle">帖子</dt>
              <dd className="m-0 text-right text-[13px] font-semibold text-text">
                {postCountLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="m-0 text-[13px] text-text-subtle">社区</dt>
              <dd className="m-0 wrap-anywhere text-right text-[13px] font-semibold text-text">
                r/{subreddit.name}
              </dd>
            </div>
          </dl>
          <Link
            className="btn-primary mx-4 mb-4 flex min-h-9 items-center justify-center no-underline"
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
