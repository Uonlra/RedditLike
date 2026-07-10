import { paginationOptsValidator, type PaginationResult } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getOrCreateCurrentUser } from "./users";

const COMMENT_COUNT_LIMIT = 1000;

type EnrichedPost = Doc<"posts"> & {
  author: { username: string } | null;
  subreddit: { _id: Id<"subreddits">; name: string } | null;
  imageUrl: string | null;
  commentCount: number;
};

const ERROR_MESSAGES = {
  POST_NOT_FOUND: "未找到帖子。",
  SUBREDDIT_NOT_FOUND: "未找到社区。",
  UNAUTHORIZED_DELETE: "你不能删除这篇帖子。",
} as const;

async function getCommentCount(ctx: QueryCtx, postId: Id<"posts">) {
  const comments = await ctx.db
    .query("comments")
    .withIndex("by_postId", (q) => q.eq("postId", postId))
    .take(COMMENT_COUNT_LIMIT);

  return comments.length;
}

async function getEnrichedPost(
  ctx: QueryCtx,
  post: Doc<"posts">,
): Promise<EnrichedPost> {
  const [author, subreddit, imageUrl, commentCount] = await Promise.all([
    ctx.db.get(post.authorId),
    ctx.db.get(post.subredditId),
    post.image ? ctx.storage.getUrl(post.image) : Promise.resolve(null),
    getCommentCount(ctx, post._id),
  ]);

  return {
    ...post,
    author: author ? { username: author.username } : null,
    subreddit: subreddit ? { _id: subreddit._id, name: subreddit.name } : null,
    imageUrl,
    commentCount,
  };
}

async function getEnrichedPosts(
  ctx: QueryCtx,
  posts: Doc<"posts">[],
): Promise<EnrichedPost[]> {
  return Promise.all(posts.map((post) => getEnrichedPost(ctx, post)));
}

export const create = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
    subredditId: v.id("subreddits"),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const subreddit = await ctx.db.get(args.subredditId);

    if (!subreddit) {
      throw new ConvexError({ message: ERROR_MESSAGES.SUBREDDIT_NOT_FOUND });
    }

    return await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      authorId: user._id,
      subredditId: args.subredditId,
      image: args.storageId,
    });
  },
});

export const getPost = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;

    return await getEnrichedPost(ctx, post);
  },
});

export const getSubredditPosts = query({
  args: {
    subredditName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<PaginationResult<EnrichedPost>> => {
    const subreddit = await ctx.db
      .query("subreddits")
      .withIndex("by_normalizedName", (q) =>
        q.eq("normalizedName", args.subredditName.toLowerCase()),
      )
      .unique();

    if (!subreddit) {
      throw new ConvexError({ message: ERROR_MESSAGES.SUBREDDIT_NOT_FOUND });
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_subredditId", (q) => q.eq("subredditId", subreddit._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...posts,
      page: await getEnrichedPosts(ctx, posts.page),
    };
  },
});

export const userPosts = query({
  args: {
    authorUsername: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<PaginationResult<EnrichedPost>> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.authorUsername))
      .unique();

    if (!user) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...posts,
      page: await getEnrichedPosts(ctx, posts.page),
    };
  },
});

export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new ConvexError({ message: ERROR_MESSAGES.POST_NOT_FOUND });
    }

    const user = await getOrCreateCurrentUser(ctx);
    if (post.authorId !== user._id) {
      throw new ConvexError({ message: ERROR_MESSAGES.UNAUTHORIZED_DELETE });
    }

    await ctx.db.delete(args.id);
  },
});

export const search = query({
  args: {
    queryStr: v.string(),
    subredditName: v.string(),
  },
  handler: async (ctx, args) => {
    const queryStr = args.queryStr.trim();
    if (!queryStr) return [];

    const subreddit = await ctx.db
      .query("subreddits")
      .withIndex("by_normalizedName", (q) =>
        q.eq("normalizedName", args.subredditName.toLowerCase()),
      )
      .unique();

    if (!subreddit) return [];

    const posts = await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) =>
        q.search("title", queryStr).eq("subredditId", subreddit._id),
      )
      .take(10);

    return posts.map((post) => ({
      _id: post._id,
      title: post.title,
      type: "post",
      name: subreddit.name,
    }));
  },
});
