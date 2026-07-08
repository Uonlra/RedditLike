import type { Id } from "./_generated/dataModel";

export function commentCountKey(postId: Id<"posts">) {
  return `comments:${postId}`;
}

export function postCountKey(subredditId: Id<"subreddits">) {
  return `posts:${subredditId}`;
}
