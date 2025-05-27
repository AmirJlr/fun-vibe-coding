"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { Heart, ExternalLink, MessageCircle, ChevronLeft, ChevronRight, Send, Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ProjectDetailPage() {
  const params = useParams();
  const { user } = useUser();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);

  const slug = params.slug as string;
  const project = useQuery(api.projects.getProjectBySlug, { slug });
  const comments = useQuery(
    api.comments.getProjectComments, 
    project ? { projectId: project._id } : "skip"
  );
  const hasVoted = useQuery(
    api.votes.hasUserVotedForProject,
    user && project ? { projectId: project._id, userId: user.id } : "skip"
  );

  const voteForProject = useMutation(api.votes.voteForProject);
  const removeVoteForProject = useMutation(api.votes.removeVoteForProject);
  const createComment = useMutation(api.comments.createComment);
  const updateComment = useMutation(api.comments.updateComment);
  const deleteComment = useMutation(api.comments.deleteComment);

  const handleVote = async () => {
    if (!user || !project || isVoting) return;

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
    if (project?.link) {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !project || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await createComment({
        projectId: project._id,
        userId: user.id,
        userName: user.fullName || user.firstName || "Anonymous",
        userAvatar: user.imageUrl,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!user || !editingCommentText.trim() || isUpdatingComment) return;

    setIsUpdatingComment(true);
    try {
      await updateComment({
        commentId: commentId as Id<"comments">,
        content: editingCommentText.trim(),
        userId: user.id,
      });
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || isDeletingComment) return;

    const confirmed = window.confirm("Are you sure you want to delete this comment? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeletingComment(commentId);
    try {
      await deleteComment({
        commentId: commentId as Id<"comments">,
        userId: user.id,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    } finally {
      setIsDeletingComment(null);
    }
  };

  const allImages = project ? [project.mainImage, ...project.screenshots] : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (project === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={project.title}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        onClick={prevImage}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="text-xs">
                          {(user.fullName || user.firstName || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts about this project..."
                          disabled={isSubmittingComment}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!commentText.trim() || isSubmittingComment}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                    <p className="text-muted-foreground">
                      Please sign in to leave a comment
                    </p>
                  </div>
                )}

                {/* Comments List */}
                {comments === undefined ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.userAvatar} />
                          <AvatarFallback className="text-xs">
                            {comment.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment._creationTime).toLocaleDateString()}
                              </span>
                            </div>
                            {user && user.id === comment.userId && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditComment(comment._id, comment.content)}
                                  disabled={editingCommentId === comment._id || isDeletingComment === comment._id}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  disabled={editingCommentId === comment._id || isDeletingComment === comment._id}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                                >
                                  {isDeletingComment === comment._id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {editingCommentId === comment._id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                disabled={isUpdatingComment}
                                className="text-sm"
                              />
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateComment(comment._id)}
                                  disabled={!editingCommentText.trim() || isUpdatingComment}
                                  className="h-7 px-2 text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  {isUpdatingComment ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={isUpdatingComment}
                                  className="h-7 px-2 text-xs"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{comment.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button
                    onClick={handleVisit}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    size="lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Project
                  </Button>
                  
                  <Button
                    variant={hasVoted ? "default" : "outline"}
                    onClick={handleVote}
                    disabled={!user || isVoting}
                    className={`w-full vote-button ${hasVoted ? "voted" : ""}`}
                    size="lg"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${hasVoted ? "fill-current" : ""}`} />
                    {hasVoted ? "Voted" : "Vote"} ({project.voteCount})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Created by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={project.creatorAvatar} />
                    <AvatarFallback>
                      {project.creatorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.creatorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 