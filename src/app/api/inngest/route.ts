import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { demoGenerate } from "@/inngest/function";
import { processMessage } from "@/features/conversations/inngest/process-message";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [demoGenerate, processMessage],
});
