import { usePaginatedQuery, useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PostCard from "../components/PostCard";
import "../styles/SubredditPage.css";

const formatCreatedDate = (timestamp: number) => {
  return new Intl.DateTimeFormat("en", {
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
          <h1>Subreddit not found</h1>
          <p>The subreddit r/{subredditName} was not found.</p>
        </section>
      </div>
    );
  }

  const description = subreddit.description?.trim() || "No description yet.";
  const createdDate = formatCreatedDate(subreddit._creationTime);
  const postCountLabel = `${subreddit.postCount} ${subreddit.postCount === 1 ? "post" : "posts"}`;

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
        <main className="subreddit-posts" aria-label={`Posts in r/${subreddit.name}`}>
          {posts.length === 0 ? (
            <div className="subreddit-posts-empty">
              <p>No posts yet. Be the first to post.</p>
            </div>
          ) : (
            <div className="subreddit-post-list">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
          {status === "CanLoadMore" && (
            <button className="subreddit-load-more" onClick={() => loadMore(20)}>
              Load More
            </button>
          )}
        </main>

        <aside className="subreddit-about" aria-label="Community information">
          <div className="subreddit-about-header">About Community</div>
          <p className="subreddit-about-description">{description}</p>
          <dl className="subreddit-meta-list">
            <div>
              <dt>Created</dt>
              <dd>{createdDate}</dd>
            </div>
            <div>
              <dt>Posts</dt>
              <dd>{postCountLabel}</dd>
            </div>
            <div>
              <dt>Community</dt>
              <dd>r/{subreddit.name}</dd>
            </div>
          </dl>
          <Link className="subreddit-create-post" to={`/r/${subreddit.name}/submit`}>
            Create Post
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default SubredditPage;
