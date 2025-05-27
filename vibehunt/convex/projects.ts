import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Utility function to generate URL-friendly slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .substring(0, 50); // Limit length
}

/**
 * Get all projects sorted by vote count (highest first)
 */
export const getAllProjects = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      mainImage: v.string(),
      screenshots: v.array(v.string()),
      link: v.string(),
      tags: v.array(v.string()),
      creatorId: v.string(),
      creatorName: v.string(),
      creatorAvatar: v.optional(v.string()),
      voteCount: v.number(),
      commentCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_votes")
      .order("desc")
      .collect();
    return projects;
  },
});

/**
 * Get a single project by ID
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      mainImage: v.string(),
      screenshots: v.array(v.string()),
      link: v.string(),
      tags: v.array(v.string()),
      creatorId: v.string(),
      creatorName: v.string(),
      creatorAvatar: v.optional(v.string()),
      voteCount: v.number(),
      commentCount: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    return project;
  },
});

/**
 * Get a single project by slug
 */
export const getProjectBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      mainImage: v.string(),
      screenshots: v.array(v.string()),
      link: v.string(),
      tags: v.array(v.string()),
      creatorId: v.string(),
      creatorName: v.string(),
      creatorAvatar: v.optional(v.string()),
      voteCount: v.number(),
      commentCount: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return project;
  },
});

/**
 * Search projects by title and filter by tags
 */
export const searchProjects = query({
  args: {
    searchTerm: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      mainImage: v.string(),
      screenshots: v.array(v.string()),
      link: v.string(),
      tags: v.array(v.string()),
      creatorId: v.string(),
      creatorName: v.string(),
      creatorAvatar: v.optional(v.string()),
      voteCount: v.number(),
      commentCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let projects;
    
    if (args.searchTerm.trim()) {
      // Use search index for text search
      projects = await ctx.db
        .query("projects")
        .withSearchIndex("search_projects", (q) => 
          q.search("title", args.searchTerm)
        )
        .collect();
    } else {
      // Get all projects if no search term
      projects = await ctx.db
        .query("projects")
        .collect();
    }
    
    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      projects = projects.filter(project => 
        args.tags!.some(tag => project.tags.includes(tag))
      );
    }
    
    // Sort by vote count (highest first)
    return projects.sort((a, b) => b.voteCount - a.voteCount);
  },
});

/**
 * Get projects by a specific creator
 */
export const getProjectsByCreator = query({
  args: { creatorId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      mainImage: v.string(),
      screenshots: v.array(v.string()),
      link: v.string(),
      tags: v.array(v.string()),
      creatorId: v.string(),
      creatorName: v.string(),
      creatorAvatar: v.optional(v.string()),
      voteCount: v.number(),
      commentCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .collect();
    return projects;
  },
});

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    mainImage: v.string(),
    screenshots: v.array(v.string()),
    link: v.string(),
    tags: v.array(v.string()),
    creatorId: v.string(),
    creatorName: v.string(),
    creatorAvatar: v.optional(v.string()),
  },
  returns: v.object({
    projectId: v.id("projects"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    // Generate a unique slug
    let baseSlug = generateSlug(args.title);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      slug: slug,
      description: args.description,
      mainImage: args.mainImage,
      screenshots: args.screenshots,
      link: args.link,
      tags: args.tags,
      creatorId: args.creatorId,
      creatorName: args.creatorName,
      creatorAvatar: args.creatorAvatar,
      voteCount: 0,
      commentCount: 0,
    });
    return { projectId, slug };
  },
});

/**
 * Update a project (only by creator)
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    mainImage: v.optional(v.string()),
    screenshots: v.optional(v.array(v.string())),
    link: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.creatorId !== args.userId) {
      throw new Error("Only the creator can update this project");
    }

    const updates: Partial<typeof project> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.mainImage !== undefined) updates.mainImage = args.mainImage;
    if (args.screenshots !== undefined) updates.screenshots = args.screenshots;
    if (args.link !== undefined) updates.link = args.link;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.projectId, updates);
    return null;
  },
});

/**
 * Delete a project (only by creator)
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.creatorId !== args.userId) {
      throw new Error("Only the creator can delete this project");
    }

    // Delete all votes for this project
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_project_and_user")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete all comments for this project
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
    return null;
  },
}); 