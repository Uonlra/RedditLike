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
});
