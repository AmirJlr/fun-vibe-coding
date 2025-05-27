import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    mainImage: v.string(),
    screenshots: v.array(v.string()),
    link: v.string(),
    tags: v.array(v.string()),
    creatorId: v.string(), // Clerk user ID
    creatorName: v.string(),
    creatorAvatar: v.optional(v.string()),
    voteCount: v.number(),
    commentCount: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_votes", ["voteCount"])
    .index("by_slug", ["slug"])
    .searchIndex("search_projects", {
      searchField: "title",
      filterFields: ["tags"],
    }),

  votes: defineTable({
    projectId: v.id("projects"),
    userId: v.string(), // Clerk user ID
    type: v.union(v.literal("project"), v.literal("comment")),
    targetId: v.string(), // project ID or comment ID
  })
    .index("by_project_and_user", ["projectId", "userId"])
    .index("by_user", ["userId"])
    .index("by_target", ["targetId", "type"]),

  comments: defineTable({
    projectId: v.id("projects"),
    userId: v.string(), // Clerk user ID
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    content: v.string(),
    parentId: v.optional(v.id("comments")), // For replies
    voteCount: v.number(),
    depth: v.number(), // 0 for top-level, 1 for replies, etc.
  })
    .index("by_project", ["projectId"])
    .index("by_parent", ["parentId"])
    .index("by_user", ["userId"]),
}); 