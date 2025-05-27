"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Code2, Users, Zap, Heart, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
            About Vibe Hunt
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A platform dedicated to showcasing the most creative and innovative Vibe coding projects.
            Where creativity meets code, and developers share their digital masterpieces.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl">
              <Target className="h-6 w-6 mr-2" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Vibe Hunt is more than just a showcase platform—it's a celebration of creative coding.
              We believe that code can be art, and every developer has the potential to create something
              beautiful, innovative, and inspiring. Our mission is to provide a space where these
              digital creations can be discovered, appreciated, and celebrated by the global developer community.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Palette className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold mb-2">Showcase Creativity</h3>
              <p className="text-muted-foreground">
                Highlight the most creative and visually stunning coding projects from the Vibe community.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Code2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Celebrate Innovation</h3>
              <p className="text-muted-foreground">
                Recognize groundbreaking techniques, novel approaches, and technical excellence in coding.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Build Community</h3>
              <p className="text-muted-foreground">
                Connect developers worldwide through shared appreciation for creative coding projects.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Platform Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Project Showcase</h4>
                <p className="text-sm text-muted-foreground">
                  Beautiful galleries with image carousels, detailed descriptions, and live project links.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Community Voting</h4>
                <p className="text-sm text-muted-foreground">
                  Democratic voting system to highlight the most appreciated projects.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Real-time Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Live vote counts and comments powered by Convex for instant community interaction.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Search & Discovery</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced search and filtering to help you discover projects that match your interests.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                What We Value
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Creativity First</h4>
                <p className="text-sm text-muted-foreground">
                  We prioritize innovative and creative approaches over conventional solutions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quality Over Quantity</h4>
                <p className="text-sm text-muted-foreground">
                  We focus on showcasing high-quality projects that demonstrate skill and creativity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Inclusive Community</h4>
                <p className="text-sm text-muted-foreground">
                  We welcome developers of all skill levels and backgrounds to share their work.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Open Source Spirit</h4>
                <p className="text-sm text-muted-foreground">
                  We encourage sharing knowledge, techniques, and inspiration within the community.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Built with Modern Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <h4 className="font-semibold">Next.js</h4>
                <p className="text-sm text-muted-foreground">React Framework</p>
              </div>
              <div>
                <h4 className="font-semibold">TypeScript</h4>
                <p className="text-sm text-muted-foreground">Type Safety</p>
              </div>
              <div>
                <h4 className="font-semibold">Convex</h4>
                <p className="text-sm text-muted-foreground">Real-time Backend</p>
              </div>
              <div>
                <h4 className="font-semibold">Tailwind CSS</h4>
                <p className="text-sm text-muted-foreground">Modern Styling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Ready to Share Your Vibe?</h2>
            <p className="text-muted-foreground mb-6">
              Join our community of creative developers and showcase your amazing projects to the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="/submit">Submit Your Project</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/community">Join Community</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 