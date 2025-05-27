"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { api } from "../../../convex/_generated/api";
import { Upload, Link, X, Image as ImageIcon } from "lucide-react";

export default function SubmitPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageMode, setMainImageMode] = useState<"url" | "upload">("url");
  const [screenshotModes, setScreenshotModes] = useState<("url" | "upload")[]>(["url"]);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  
  const createProject = useMutation(api.projects.createProject);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrlMutation);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mainImage: "",
    screenshots: [""],
    link: "",
    tags: [""],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        mainImage: formData.mainImage,
        screenshots: formData.screenshots.filter(url => url.trim() !== ""),
        link: formData.link,
        tags: formData.tags.filter(tag => tag.trim() !== ""),
        creatorId: user.id,
        creatorName: user.fullName || user.firstName || "Anonymous",
        creatorAvatar: user.imageUrl,
      };

      const result = await createProject(projectData);
      router.push(`/project/${result.slug}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File, type: "main" | "screenshot", index?: number) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    
    const key = type === "main" ? "main" : `screenshot-${index}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));
    
    try {
      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Step 2: Upload file to the generated URL
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        const errorText = await result.text();
        console.error("Upload failed:", result.status, errorText);
        throw new Error(`Upload failed: ${result.status}`);
      }
      
      const { storageId } = await result.json();
      
      if (!storageId) {
        throw new Error("No storage ID returned");
      }
      
      // Step 3: Get the file URL from Convex storage
      const fileUrl = await getFileUrl({ storageId });
      
      if (!fileUrl) {
        throw new Error("Failed to get file URL from storage");
      }
      
      // Update form data with the actual URL
      if (type === "main") {
        setFormData(prev => ({ ...prev, mainImage: fileUrl }));
      } else if (index !== undefined) {
        setFormData(prev => {
          const newScreenshots = [...prev.screenshots];
          newScreenshots[index] = fileUrl;
          return { ...prev, screenshots: newScreenshots };
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const addScreenshot = () => {
    setFormData(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, ""]
    }));
    setScreenshotModes(prev => [...prev, "url"]);
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
    setScreenshotModes(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ""]
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Sign in required</h1>
            <p className="text-muted-foreground">
              Please sign in to submit your Vibe coding project.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Submit Your Vibe Project</CardTitle>
            <p className="text-muted-foreground">
              Share your amazing Vibe coding project with the community! You can add images by providing URLs or uploading files directly.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your project title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project..."
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

              {/* Main Image */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Main Image *</label>
                  <div className="flex rounded-lg border border-input bg-background p-1">
                    <Button
                      type="button"
                      variant={mainImageMode === "url" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMainImageMode("url")}
                      className="h-7 px-3 text-xs"
                    >
                      <Link className="h-3 w-3 mr-1" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={mainImageMode === "upload" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMainImageMode("upload")}
                      className="h-7 px-3 text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>
                
                {mainImageMode === "url" ? (
                  <Input
                    type="url"
                    value={formData.mainImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingFiles.main ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "main");
                          }}
                          disabled={uploadingFiles.main}
                        />
                      </label>
                    </div>
                    {formData.mainImage && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm text-muted-foreground">Image uploaded successfully</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, mainImage: "" }))}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {formData.mainImage.startsWith('http') && (
                          <div className="relative w-full h-32 rounded border overflow-hidden">
                            <img 
                              src={formData.mainImage} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Screenshots */}
              <div>
                <label className="block text-sm font-medium mb-2">Additional Screenshots</label>
                {formData.screenshots.map((screenshot, index) => (
                  <div key={index} className="space-y-2 mb-4 p-3 border border-input rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Screenshot {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg border border-input bg-background p-1">
                          <Button
                            type="button"
                            variant={screenshotModes[index] === "url" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                              const newModes = [...screenshotModes];
                              newModes[index] = "url";
                              setScreenshotModes(newModes);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Link className="h-3 w-3 mr-1" />
                            URL
                          </Button>
                          <Button
                            type="button"
                            variant={screenshotModes[index] === "upload" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                              const newModes = [...screenshotModes];
                              newModes[index] = "upload";
                              setScreenshotModes(newModes);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeScreenshot(index)}
                          disabled={formData.screenshots.length === 1}
                          className="h-6 px-2 text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    {screenshotModes[index] === "url" ? (
                      <Input
                        type="url"
                        value={screenshot}
                        onChange={(e) => {
                          const newScreenshots = [...formData.screenshots];
                          newScreenshots[index] = e.target.value;
                          setFormData(prev => ({ ...prev, screenshots: newScreenshots }));
                        }}
                        placeholder="https://example.com/screenshot.jpg"
                      />
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                              {uploadingFiles[`screenshot-${index}`] ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              ) : (
                                <>
                                  <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">Click to upload</p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "screenshot", index);
                              }}
                              disabled={uploadingFiles[`screenshot-${index}`]}
                            />
                          </label>
                        </div>
                        {screenshot && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-xs text-muted-foreground">Image uploaded successfully</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newScreenshots = [...formData.screenshots];
                                  newScreenshots[index] = "";
                                  setFormData(prev => ({ ...prev, screenshots: newScreenshots }));
                                }}
                                className="h-5 w-5 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {screenshot.startsWith('http') && (
                              <div className="relative w-full h-20 rounded border overflow-hidden">
                                <img 
                                  src={screenshot} 
                                  alt="Screenshot preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addScreenshot}>
                  Add Screenshot
                </Button>
              </div>

              {/* Project Link */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Link *</label>
                <Input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://your-project.com"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...formData.tags];
                        newTags[index] = e.target.value;
                        setFormData(prev => ({ ...prev, tags: newTags }));
                      }}
                      placeholder="e.g., React, Animation, Game"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeTag(index)}
                      disabled={formData.tags.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTag}>
                  Add Tag
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 