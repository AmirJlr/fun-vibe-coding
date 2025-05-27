import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Check if a user has voted for a specific project
 */
export const hasUserVotedForProject = query({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("type"), "project"))
      .first();
    
    return vote !== null;
  },
});

/**
 * Check if a user has voted for a specific comment
 */
export const hasUserVotedForComment = query({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.commentId).eq("type", "comment")
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    return vote !== null;
  },
});

/**
 * Get all votes for a user
 */
export const getUserVotes = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("votes"),
      projectId: v.id("projects"),
      userId: v.string(),
      type: v.union(v.literal("project"), v.literal("comment")),
      targetId: v.string(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return votes;
  },
});

/**
 * Vote for a project
 */
export const voteForProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if user already voted
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("type"), "project"))
      .first();

    if (existingVote) {
      throw new Error("User has already voted for this project");
    }

    // Check if project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Create vote
    await ctx.db.insert("votes", {
      projectId: args.projectId,
      userId: args.userId,
      type: "project",
      targetId: args.projectId,
    });

    // Update project vote count
    await ctx.db.patch(args.projectId, {
      voteCount: project.voteCount + 1,
    });

    return null;
  },
});

/**
 * Remove vote for a project
 */
export const removeVoteForProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find existing vote
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("type"), "project"))
      .first();

    if (!existingVote) {
      throw new Error("User has not voted for this project");
    }

    // Check if project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Remove vote
    await ctx.db.delete(existingVote._id);

    // Update project vote count
    await ctx.db.patch(args.projectId, {
      voteCount: Math.max(0, project.voteCount - 1),
    });

    return null;
  },
});

/**
 * Vote for a comment
 */
export const voteForComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if user already voted
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.commentId).eq("type", "comment")
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingVote) {
      throw new Error("User has already voted for this comment");
    }

    // Check if comment exists
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Create vote
    await ctx.db.insert("votes", {
      projectId: comment.projectId,
      userId: args.userId,
      type: "comment",
      targetId: args.commentId,
    });

    // Update comment vote count
    await ctx.db.patch(args.commentId, {
      voteCount: comment.voteCount + 1,
    });

    return null;
  },
});

/**
 * Remove vote for a comment
 */
export const removeVoteForComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find existing vote
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.commentId).eq("type", "comment")
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!existingVote) {
      throw new Error("User has not voted for this comment");
    }

    // Check if comment exists
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Remove vote
    await ctx.db.delete(existingVote._id);

    // Update comment vote count
    await ctx.db.patch(args.commentId, {
      voteCount: Math.max(0, comment.voteCount - 1),
    });

    return null;
  },
}); 