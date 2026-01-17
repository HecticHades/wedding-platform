"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle } from "lucide-react";
import { updateSectionContent } from "@/app/(platform)/dashboard/content/[section]/actions";

interface OurStoryEditorProps {
  initialContent: PrismaJson.SectionContent;
}

export function OurStoryEditor({ initialContent }: OurStoryEditorProps) {
  // Type guard to ensure we have our-story content
  const typedContent =
    initialContent.type === "our-story"
      ? initialContent
      : { type: "our-story" as const, title: "Our Story", story: "", photos: [] };

  const [title, setTitle] = useState(typedContent.title);
  const [story, setStory] = useState(typedContent.story);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    // Basic validation
    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a title for your story.");
      return;
    }

    if (!story.trim()) {
      setStatus("error");
      setErrorMessage("Please write your story.");
      return;
    }

    startTransition(async () => {
      const content: PrismaJson.OurStoryContent = {
        type: "our-story",
        title: title.trim(),
        story: story.trim(),
        photos: typedContent.photos || [],
      };

      const result = await updateSectionContent("our-story", content);

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to save");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {status === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="h-5 w-5" />
          Changes saved successfully!
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Our Story, How We Met"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Story */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Story <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Share how you met, your journey together, and what makes your love
            story special. Markdown formatting is supported.
          </p>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Tell your guests how you met and fell in love..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          <div className="mt-2 text-sm text-gray-500">
            <strong>Markdown tips:</strong> **bold**, *italic*, ## Heading
          </div>
        </div>

        {/* Photo upload placeholder */}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            Photo uploads for your story will be available in a future update.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            For now, use the Gallery section to share your photos.
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
