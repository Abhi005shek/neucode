import ProjectIdView from "@/features/projects/components/project-id-view";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function page({
  params,
}: {
  params: Promise<{ projectId: Id<"projects"> }>;
}) {
  const { projectId } = await params;
  return <ProjectIdView projectId={projectId} />;
}
