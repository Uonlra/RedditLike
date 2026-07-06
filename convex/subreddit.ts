import { mutation, query } from "./_generated/server";
import { getOrCreateCurrentUser } from "./users";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

const POST_COUNT_LIMIT = 1000;

type EnrichedSubreddit = Doc<"subreddits"> & {
  postCount: number;
};

async function getPostCount(ctx: QueryCtx, subredditId: Id<"subreddits">) {
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_subredditId", (q) => q.eq("subredditId", subredditId))
    .take(POST_COUNT_LIMIT);

  return posts.length;
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const normalizedName = args.name.toLowerCase();
    const subreddit = await ctx.db
      .query("subreddits")
      .withIndex("by_normalizedName", (q) =>
        q.eq("normalizedName", normalizedName),
      )
      .unique();

    if (subreddit) {
      throw new ConvexError({ message: "Subreddit already exists" });
    }

    await ctx.db.insert("subreddits", {
      name: args.name,
      normalizedName,
      description: args.description,
      authorId: user._id,
    });
  },
});

export const get = query({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<EnrichedSubreddit | null> => {
    const subreddit = await ctx.db
      .query("subreddits")
      .withIndex("by_normalizedName", (q) =>
        q.eq("normalizedName", args.name.toLowerCase()),
      )
      .unique();

    if (!subreddit) return null;

    return {
      ...subreddit,
      postCount: await getPostCount(ctx, subreddit._id),
    };
  },
});

export const search = query({
  args: { queryStr: v.string() },
  handler: async (ctx, args) => {
    const queryStr = args.queryStr.trim();
    if (!queryStr) return [];

    const subreddits = await ctx.db
      .query("subreddits")
      .withSearchIndex("search_name", (q) => q.search("name", queryStr))
      .take(10);

    return subreddits.map((sub) => ({
      ...sub,
      type: "community",
      title: sub.name,
    }));
  },
});
