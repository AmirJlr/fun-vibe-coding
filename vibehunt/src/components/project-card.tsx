"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Heart, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ProjectCardProps {
  project: {
    _id: Id<"projects">;
    _creationTime: number;
    title: string;
    slug: string;
    description: string;
    mainImage: string;
    screenshots: string[];
    link: string;
    tags: string[];
    creatorId: string;
    creatorName: string;
    creatorAvatar?: string;
    voteCount: number;
    commentCount: number;
  };
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { user } = useUser();
  const [isVoting, setIsVoting] = useState(false);

  const hasVoted = useQuery(
    api.votes.hasUserVotedForProject,
    user ? { projectId: project._id, userId: user.id } : "skip"
  );

  const voteForProject = useMutation(api.votes.voteForProject);
  const removeVoteForProject = useMutation(api.votes.removeVoteForProject);

  const handleVote = async () => {
    if (!user || isVoting) return;

    setIsVoting(true);
    try {
      if (hasVoted) {
        await removeVoteForProject({
          projectId: project._id,
          userId: user.id,
        });
      } else {
        await voteForProject({
          projectId: project._id,
          userId: user.id,
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleVisit = () => {
    window.open(project.link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="project-card overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={project.mainImage}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/project/${project.slug}`}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
              {project.title}
            </h3>
          </Link>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.creatorAvatar} />
            <AvatarFallback className="text-xs">
              {project.creatorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            by {project.creatorName}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleVote}
            disabled={!user || isVoting}
            className={`vote-button ${hasVoted ? "voted" : ""}`}
          >
            <Heart className={`h-4 w-4 mr-1 ${hasVoted ? "fill-current" : ""}`} />
            {project.voteCount}
          </Button>
          
          <div className="flex items-center text-muted-foreground">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">{project.commentCount}</span>
          </div>
        </div>
        
        <Button size="sm" onClick={handleVisit} className="bg-red-500 hover:bg-red-600 text-white">
          <ExternalLink className="h-4 w-4 mr-1" />
          Visit
        </Button>
      </CardFooter>
    </Card>
  );
}; 