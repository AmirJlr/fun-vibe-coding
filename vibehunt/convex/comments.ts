import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper function for recursive comment deletion
async function deleteCommentRecursive(ctx: any, commentId: Id<"comments">, userId: string) {
  const comment = await ctx.db.get(commentId);
  if (!comment || comment.userId !== userId) {
    return;
  }

  // Get all replies to this comment
  const replies = await ctx.db
    .query("comments")
    .withIndex("by_parent", (q: any) => q.eq("parentId", commentId))
    .collect();

  // Delete all replies recursively
  for (const reply of replies) {
    await deleteCommentRecursive(ctx, reply._id, userId);
  }

  // Delete all votes for this comment
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_target", (q: any) =>
      q.eq("targetId", commentId).eq("type", "comment")
    )
    .collect();
  
  for (const vote of votes) {
    await ctx.db.delete(vote._id);
  }

  // Delete the comment
  await ctx.db.delete(commentId);
}

/**
 * Get all comments for a project (with threading)
 */
export const getProjectComments = query({
  args: { projectId: v.id("projects") },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      userId: v.string(),
      userName: v.string(),
      userAvatar: v.optional(v.string()),
      content: v.string(),
      parentId: v.optional(v.id("comments")),
      voteCount: v.number(),
      depth: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();
    
    // Sort comments to show top-level first, then replies in chronological order
    return comments.sort((a, b) => {
      if (a.depth !== b.depth) {
        return a.depth - b.depth;
      }
      return a._creationTime - b._creationTime;
    });
  },
});

/**
 * Get replies for a specific comment
 */
export const getCommentReplies = query({
  args: { parentId: v.id("comments") },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      userId: v.string(),
      userName: v.string(),
      userAvatar: v.optional(v.string()),
      content: v.string(),
      parentId: v.optional(v.id("comments")),
      voteCount: v.number(),
      depth: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .order("asc")
      .collect();
    
    return replies;
  },
});

/**
 * Get comments by a specific user
 */
export const getCommentsByUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      userId: v.string(),
      userName: v.string(),
      userAvatar: v.optional(v.string()),
      content: v.string(),
      parentId: v.optional(v.id("comments")),
      voteCount: v.number(),
      depth: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return comments;
  },
});

/**
 * Create a new comment
 */
export const createComment = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    // Check if project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    let depth = 0;
    
    // If this is a reply, check parent comment and calculate depth
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      
      // Ensure parent comment belongs to the same project
      if (parentComment.projectId !== args.projectId) {
        throw new Error("Parent comment does not belong to this project");
      }
      
      depth = parentComment.depth + 1;
      
      // Limit nesting depth to prevent infinite threading
      if (depth > 5) {
        throw new Error("Maximum comment depth exceeded");
      }
    }

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      projectId: args.projectId,
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      content: args.content,
      parentId: args.parentId,
      voteCount: 0,
      depth,
    });

    // Update project comment count (only for top-level comments)
    if (depth === 0) {
      await ctx.db.patch(args.projectId, {
        commentCount: project.commentCount + 1,
      });
    }

    return commentId;
  },
});

/**
 * Update a comment (only by author)
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    if (comment.userId !== args.userId) {
      throw new Error("Only the author can update this comment");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
    });

    return null;
  },
});

/**
 * Delete a comment (only by author)
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    if (comment.userId !== args.userId) {
      throw new Error("Only the author can delete this comment");
    }

    // Get all replies to this comment
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .collect();

    // Delete all replies recursively
    for (const reply of replies) {
      // For recursive deletion, we'll handle it differently to avoid circular imports
      await deleteCommentRecursive(ctx, reply._id, args.userId);
    }

    // Delete all votes for this comment
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.commentId).eq("type", "comment")
      )
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Update project comment count if this is a top-level comment
    if (comment.depth === 0) {
      const project = await ctx.db.get(comment.projectId);
      if (project) {
        await ctx.db.patch(comment.projectId, {
          commentCount: Math.max(0, project.commentCount - 1),
        });
      }
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);
    return null;
  },
}); 