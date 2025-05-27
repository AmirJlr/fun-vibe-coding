"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { Navigation } from "@/components/navigation";
import { ProjectCard } from "@/components/project-card";
import { api } from "../../../convex/_generated/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  
  const searchResults = useQuery(
    api.projects.searchProjects,
    { searchTerm, tags: undefined }
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Search Results
          </h1>
          {searchTerm && (
            <p className="text-muted-foreground">
              Showing results for: <span className="font-medium">"{searchTerm}"</span>
            </p>
          )}
        </div>

        {/* Search Results */}
        {searchResults === undefined ? (
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
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No results found</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? `No projects found matching "${searchTerm}". Try different keywords or browse all projects.`
                : "Enter a search term to find projects."
              }
            </p>
            <a 
              href="/" 
              className="text-primary hover:underline"
            >
              Browse all projects
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {searchResults.length} project{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 