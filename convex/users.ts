import { internalMutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { UserJSON } from "@clerk/backend";
import { ConvexError, v } from "convex/values";
import type { Validator } from "convex/values";
import { clerkTokenIdentifier } from "./authConstants";

const USER_POST_COUNT_LIMIT = 1000;

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const username = usernameFromClerkUser(data);

    const externalId = clerkTokenIdentifier(data.id);

    const userAttributes = {
      username,
      externalId,
    };

    const user = await userByExternalId(ctx, externalId);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

function usernameFromClerkUser(data: UserJSON) {
  const primaryEmail = data.email_addresses.find(
    (email) => email.id === data.primary_email_address_id,
  )?.email_address;

  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");

  return data.username ?? primaryEmail ?? fullName ?? data.id;
}

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkTokenIdentifier(clerkUserId));

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new ConvexError({ message: "请先登录。" });
  return userRecord;
}

export async function getOrCreateCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError({ message: "请先登录。" });
  }

  const existingUser = await userByExternalId(ctx, identity.tokenIdentifier);
  if (existingUser) return existingUser;

  const username =
    identity.preferredUsername ??
    identity.nickname ??
    identity.email ??
    identity.name ??
    identity.subject;

  const userId = await ctx.db.insert("users", {
    username,
    externalId: identity.tokenIdentifier,
  });

  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError({ message: "无法创建用户，请稍后重试。" });
  return user;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.tokenIdentifier);
}

async function userByExternalId(ctx: QueryCtx | MutationCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
    .unique();
}

export const getPublicUser = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) return null;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
      .take(USER_POST_COUNT_LIMIT);

    return {
      username: user.username,
      posts: posts.length,
    };
  },
});
