import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateCurrentUser } from "./users";

export const create = mutation({
  args: {
    body: v.string(),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const body = args.body.trim();
    if (!body) {
      throw new ConvexError({ message: "评论不能为空。" });
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError({ message: "未找到帖子。" });
    }

    const user = await getOrCreateCurrentUser(ctx);
    return await ctx.db.insert("comments", {
      body,
      postId: args.postId,
      authorId: user._id,
    });
  },
});

export const getPostComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("asc")
      .take(50);

    return await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: author ? { username: author.username } : null,
        };
      }),
    );
  },
});
