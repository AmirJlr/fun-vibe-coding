import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
 * Migration to add slugs to existing projects
 */
export const addSlugsToExistingProjects = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    
    for (const project of projects) {
      // Check if project already has a slug
      if (!("slug" in project) || !project.slug) {
        // Generate a unique slug
        let baseSlug = generateSlug(project.title);
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure slug is unique
        while (await ctx.db
          .query("projects")
          .filter((q) => q.eq(q.field("slug"), slug))
          .first()) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Update the project with the slug
        await ctx.db.patch(project._id, { slug });
        console.log(`Added slug "${slug}" to project "${project.title}"`);
      }
    }
    
    return null;
  },
}); 