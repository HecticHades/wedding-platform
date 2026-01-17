import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  sectionTypeSchema,
  getSectionLabel,
  type SectionTypeId,
} from "@/lib/content/section-types";

// Import editors
import { EventDetailsEditor } from "@/components/content-builder/editors/EventDetailsEditor";
import { OurStoryEditor } from "@/components/content-builder/editors/OurStoryEditor";
import { TravelEditor } from "@/components/content-builder/editors/TravelEditor";
import { GalleryEditor } from "@/components/content-builder/editors/GalleryEditor";
import { TimelineEditor } from "@/components/content-builder/editors/TimelineEditor";
import { ContactEditor } from "@/components/content-builder/editors/ContactEditor";

// Editor component mapping
const editors: Record<
  SectionTypeId,
  React.ComponentType<{ initialContent: PrismaJson.SectionContent }>
> = {
  "event-details": EventDetailsEditor,
  "our-story": OurStoryEditor,
  travel: TravelEditor,
  gallery: GalleryEditor,
  timeline: TimelineEditor,
  contact: ContactEditor,
};

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function SectionEditorPage({ params }: SectionPageProps) {
  const { section } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Validate section type
  const parseResult = sectionTypeSchema.safeParse(section);
  if (!parseResult.success) {
    notFound();
  }

  const sectionType = parseResult.data;
  const sectionLabel = getSectionLabel(sectionType);

  // Fetch wedding content sections
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: {
        id: true,
        contentSections: true,
      },
    });
    return { wedding };
  });

  if (!data.wedding) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">No Wedding Found</h1>
        <p className="mt-2 text-gray-600">Please contact support.</p>
      </div>
    );
  }

  // Find the section
  const sections = (data.wedding.contentSections ?? []) as PrismaJson.ContentSection[];
  const currentSection = sections.find((s) => s.type === sectionType);

  // Get the appropriate editor component
  const EditorComponent = editors[sectionType];

  return (
    <div>
      {/* Header with back link */}
      <div className="mb-8">
        <Link
          href="/dashboard/content"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content Sections
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{sectionLabel}</h1>
        <p className="mt-2 text-gray-600">
          Edit the content for your {sectionLabel.toLowerCase()} section.
        </p>
      </div>

      {/* Editor or message to add section first */}
      {currentSection ? (
        <EditorComponent initialContent={currentSection.content} />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-yellow-800">
            Section Not Added Yet
          </h2>
          <p className="mt-2 text-yellow-700">
            This section hasn&apos;t been added to your wedding website yet.
          </p>
          <Link
            href="/dashboard/content"
            className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go to Content Sections to Add It
          </Link>
        </div>
      )}
    </div>
  );
}
