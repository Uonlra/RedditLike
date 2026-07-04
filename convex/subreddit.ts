import { mutation, query } from "./_generated/server";
import { getOrCreateCurrentUser } from "./users";
import { v, ConvexError } from "convex/values";

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
    handler: async (ctx, args) => {
        const subreddit = await ctx.db
            .query("subreddits")
            .withIndex("by_normalizedName", (q) =>
                q.eq("normalizedName", args.name.toLowerCase()),
            )
            .unique();
        if (!subreddit) return null;

        return subreddit;
    },
});

export const search = query({
    args: { queryStr: v.string() },
    handler: async (ctx, args) => {
        if (!args.queryStr) return [];

        const subreddits = await ctx.db
            .query("subreddits")
            .withSearchIndex("search_name", (q) => q.search("name", args.queryStr))
            .take(10);

        return subreddits.map((sub) => {
            return { ...sub, type: "community", title: sub.name };
        });
    },
});
