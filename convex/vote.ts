import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { counts } from "./counter";
import { getCurrentUser, getOrCreateCurrentUser } from "./users";

type VoteType = "upvote" | "downvote";

export function voteKey(postId: Id<"posts">, voteType: VoteType) {
  return `${voteType}:${postId}`;
}

async function ensurePostExists(ctx: MutationCtx, postId: Id<"posts">) {
  const post = await ctx.db.get(postId);
  if (!post) {
    throw new ConvexError({ message: "Post not found." });
  }
}

function createToggleVoteMutation(voteType: VoteType) {
  return mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
      await ensurePostExists(ctx, args.postId);

      const user = await getOrCreateCurrentUser(ctx);
      const oppositeVoteType: VoteType =
        voteType === "upvote" ? "downvote" : "upvote";

      const existingVote = await ctx.db
        .query(voteType)
        .withIndex("by_postId_and_userId", (q) =>
          q.eq("postId", args.postId).eq("userId", user._id),
        )
        .unique();

      if (existingVote) {
        await ctx.db.delete(existingVote._id);
        await counts.dec(ctx, voteKey(args.postId, voteType));
        return;
      }

      const existingOppositeVote = await ctx.db
        .query(oppositeVoteType)
        .withIndex("by_postId_and_userId", (q) =>
          q.eq("postId", args.postId).eq("userId", user._id),
        )
        .unique();

      if (existingOppositeVote) {
        await ctx.db.delete(existingOppositeVote._id);
        await counts.dec(ctx, voteKey(args.postId, oppositeVoteType));
      }

      await ctx.db.insert(voteType, {
        postId: args.postId,
        userId: user._id,
      });
      await counts.inc(ctx, voteKey(args.postId, voteType));
    },
  });
}

function createHasVotedQuery(voteType: VoteType) {
  return query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return false;

      const vote = await ctx.db
        .query(voteType)
        .withIndex("by_postId_and_userId", (q) =>
          q.eq("postId", args.postId).eq("userId", user._id),
        )
        .unique();

      return vote !== null;
    },
  });
}

export const toggleUpvote = createToggleVoteMutation("upvote");
export const toggleDownvote = createToggleVoteMutation("downvote");
export const hasUpvoted = createHasVotedQuery("upvote");
export const hasDownvoted = createHasVotedQuery("downvote");

export const getVoteCounts = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const upvotes = await counts.count(ctx, voteKey(args.postId, "upvote"));
    const downvotes = await counts.count(ctx, voteKey(args.postId, "downvote"));

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
    };
  },
});
