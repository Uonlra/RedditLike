import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    externalId: v.string(),
  })
    .index("by_externalId", ["externalId"])
    .index("by_username", ["username"]),
  subreddits: defineTable({
    name: v.string(),
    normalizedName: v.string(),
    description: v.optional(v.string()),
    authorId: v.id("users"),
  })
    .index("by_normalizedName", ["normalizedName"])
    .searchIndex("search_name", {
      searchField: "name",
    }),
  posts: defineTable({
    title: v.string(),
    body: v.optional(v.string()),
    authorId: v.id("users"),
    subredditId: v.id("subreddits"),
    image: v.optional(v.id("_storage")),
  })
    .index("by_authorId", ["authorId"])
    .index("by_subredditId", ["subredditId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["subredditId"],
    }),
  comments: defineTable({
    body: v.string(),
    authorId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_authorId", ["authorId"])
    .index("by_postId", ["postId"]),
  downvote: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"])
    .index("by_postId_and_userId", ["postId", "userId"]),
  upvote: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"])
    .index("by_postId_and_userId", ["postId", "userId"]),
});
