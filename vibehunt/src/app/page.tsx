"use client";

import { useQuery } from "convex/react";
import { Navigation } from "@/components/navigation";
import { ProjectCard } from "@/components/project-card";
import { api } from "../../convex/_generated/api";

export default function HomePage() {
  const projects = useQuery(api.projects.getAllProjects);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
            Discover Amazing Vibes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the most creative and innovative Vibe coding projects from our community.
            Vote for your favorites and share your own creations.
          </p>
        </div>

        {/* Projects Grid */}
        {projects === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading skeleton */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-video mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to share your amazing Vibe coding project!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}