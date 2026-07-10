import { usePaginatedQuery, useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import "../styles/SubredditPage.css";

const formatCreatedDate = (timestamp: number) => {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
};

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
      <div className="subreddit-page">
        <section className="subreddit-hero subreddit-hero--loading">
          <div className="subreddit-avatar-placeholder" />
          <div className="subreddit-loading-lines">
            <span />
            <span />
          </div>
        </section>
      </div>
    );
  }

  if (subreddit === null) {
    return (
      <div className="subreddit-page">
        <section className="subreddit-empty-state">
          <h1>未找到社区</h1>
          <p>未找到社区 r/{subredditName}。</p>
        </section>
      </div>
    );
  }

  const description = subreddit.description?.trim() || "暂无描述。";
  const createdDate = formatCreatedDate(subreddit._creationTime);
  const postCountLabel = `${subreddit.postCount} 篇帖子`;

  return (
    <div className="subreddit-page">
      <section className="subreddit-hero">
        <div className="subreddit-avatar">r/</div>
        <div className="subreddit-title-block">
          <h1>r/{subreddit.name}</h1>
          <div className="subreddit-hero-meta">{postCountLabel}</div>
          <p>{description}</p>
        </div>
      </section>

      <div className="subreddit-layout">
        <main className="subreddit-posts" aria-label={`r/${subreddit.name} 中的帖子`}>
          {posts.length === 0 ? (
            <div className="subreddit-posts-empty">
              <p>还没有帖子，来发布第一篇吧。</p>
            </div>
          ) : (
            <div className="subreddit-post-list">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} showSubreddit />
              ))}
            </div>
          )}
          {status === "CanLoadMore" && (
            <button className="subreddit-load-more" onClick={() => loadMore(20)}>
              加载更多
            </button>
          )}
        </main>

        <aside className="subreddit-about" aria-label="社区信息">
          <div className="subreddit-about-header">关于社区</div>
          <p className="subreddit-about-description">{description}</p>
          <dl className="subreddit-meta-list">
            <div>
              <dt>创建时间</dt>
              <dd>{createdDate}</dd>
            </div>
            <div>
              <dt>帖子</dt>
              <dd>{postCountLabel}</dd>
            </div>
            <div>
              <dt>社区</dt>
              <dd>r/{subreddit.name}</dd>
            </div>
          </dl>
          <Link className="subreddit-create-post" to={`/r/${subreddit.name}/submit`}>
            发布帖子
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default SubredditPage;



