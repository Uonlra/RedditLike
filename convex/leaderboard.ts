import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { counts } from "./counter";
import { voteKey } from "./vote";

const DEFAULT_TOP_POSTS_LIMIT = 10;
const MAX_TOP_POSTS_LIMIT = 25;
const CANDIDATE_POSTS_LIMIT = 100;
const COMMENT_COUNT_LIMIT = 1000;

type TopPost = Doc<"posts"> & {
  author: { username: string } | null;
  subreddit: { _id: Id<"subreddits">; name: string } | null;
  imageUrl: string | null;
  commentCount: number;
  score: number;
  upvotes: number;
  downvotes: number;
};

async function getCommentCount(ctx: QueryCtx, postId: Id<"posts">) {
  const comments = await ctx.db
    .query("comments")
    .withIndex("by_postId", (q) => q.eq("postId", postId))
    .take(COMMENT_COUNT_LIMIT);

  return comments.length;
}

async function enrichPost(ctx: QueryCtx, post: Doc<"posts">): Promise<TopPost> {
  const [author, subreddit, imageUrl, commentCount, upvotes, downvotes] =
    await Promise.all([
      ctx.db.get(post.authorId),
      ctx.db.get(post.subredditId),
      post.image ? ctx.storage.getUrl(post.image) : Promise.resolve(null),
      getCommentCount(ctx, post._id),
      counts.count(ctx, voteKey(post._id, "upvote")),
      counts.count(ctx, voteKey(post._id, "downvote")),
    ]);

  return {
    ...post,
    author: author ? { username: author.username } : null,
    subreddit: subreddit ? { _id: subreddit._id, name: subreddit.name } : null,
    imageUrl,
    commentCount,
    score: upvotes - downvotes,
    upvotes,
    downvotes,
  };
}

function clampLimit(limit: number | undefined) {
  if (!limit) return DEFAULT_TOP_POSTS_LIMIT;
  return Math.min(Math.max(Math.floor(limit), 1), MAX_TOP_POSTS_LIMIT);
}

function sortByUpvotes(a: TopPost, b: TopPost) {
  if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
  if (b.score !== a.score) return b.score - a.score;
  if (b.commentCount !== a.commentCount) return b.commentCount - a.commentCount;
  return b._creationTime - a._creationTime;
}

export const getTopPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = clampLimit(args.limit);
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .take(CANDIDATE_POSTS_LIMIT);

    const topPosts = await Promise.all(
      posts.map((post) => enrichPost(ctx, post)),
    );

    return topPosts.sort(sortByUpvotes).slice(0, limit);
  },
});
