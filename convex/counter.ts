import { components } from "./_generated/api";
import { ShardedCounter } from "@convex-dev/sharded-counter";
import type { Id } from "./_generated/dataModel";

export const counts = new ShardedCounter<string>(components.shardedCounter, {
  defaultShards: 1,
});

export function commentCountKey(postId: Id<"posts">) {
  return `comments:${postId}`;
}

export function userPostCountKey(userId: Id<"users">) {
  return `userPosts:${userId}`;
}
