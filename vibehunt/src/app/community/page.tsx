"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, MessageCircle, Code, Zap, Globe } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
            Join Our Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow Vibe developers, share your creations, and discover amazing projects
            from around the world.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Growing Community</h3>
              <p className="text-muted-foreground">
                Join thousands of creative developers sharing their Vibe projects
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-2xl font-bold mb-2">Support & Feedback</h3>
              <p className="text-muted-foreground">
                Vote on projects and provide constructive feedback to help others grow
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Code className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold mb-2">Learn & Inspire</h3>
              <p className="text-muted-foreground">
                Discover new techniques and get inspired by innovative coding projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Community Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Be Respectful</h4>
                <p className="text-sm text-muted-foreground">
                  Treat all community members with respect and kindness. Constructive feedback is welcome.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Share Quality Content</h4>
                <p className="text-sm text-muted-foreground">
                  Submit projects that showcase creativity, innovation, or technical excellence.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Give Credit</h4>
                <p className="text-sm text-muted-foreground">
                  Always credit collaborators, libraries, and resources used in your projects.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Help Others</h4>
                <p className="text-sm text-muted-foreground">
                  Support fellow developers by voting, commenting, and sharing knowledge.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                What Makes a Great Vibe Project?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Creative Coding</h4>
                <p className="text-sm text-muted-foreground">
                  Projects that push the boundaries of what's possible with code and creativity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interactive Experiences</h4>
                <p className="text-sm text-muted-foreground">
                  Engaging user interfaces, games, animations, or interactive art pieces.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Innovation</h4>
                <p className="text-sm text-muted-foreground">
                  Novel use of technologies, clever algorithms, or impressive technical achievements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Visual Appeal</h4>
                <p className="text-sm text-muted-foreground">
                  Beautiful designs, smooth animations, or visually striking presentations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connect Section */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Globe className="h-5 w-5 mr-2" />
              Connect with the Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Ready to share your amazing Vibe coding project with the world?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="/submit">Submit Your Project</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/">Explore Projects</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 