import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { templates } from "@/lib/content/templates";
import { TemplateGallery } from "@/components/templates";
import { applyTemplate } from "./actions";

export default async function TemplatesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Get current wedding's templateId using tenant context
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: { templateId: true },
    });
    return { wedding };
  });

  // Default to "classic" if no template set
  const currentTemplateId = data.wedding?.templateId || "classic";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold font-cormorant text-[#3d3936]">
          Choose Your Template
        </h1>
        <p className="mt-2 text-[#3d3936]/70">
          Select a design template for your wedding site. Preview templates in full,
          compare side-by-side, and customize colors to match your style.
        </p>
      </div>

      <TemplateGallery
        templates={templates}
        currentTemplateId={currentTemplateId}
        onApplyTemplate={applyTemplate}
      />
    </div>
  );
}
