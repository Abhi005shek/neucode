import ProjectIdLayout from "@/features/projects/components/project-id-layout";
import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";

async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: Id<"projects"> }>;
}) {
  const { projectId } = await params;

  return <ProjectIdLayout projectId={projectId}>{children}</ProjectIdLayout>;
}

export default PageLayout;
