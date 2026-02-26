import ky from "ky";
import { z } from "zod";
import { toast } from "sonner";

const quickEditRequestSchema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
});

const quickEditResponseSchema = z.object({
  editedCode: z.string(),
});

type EditRequest = z.infer<typeof quickEditRequestSchema>;
type EditResponse = z.infer<typeof quickEditResponseSchema>;

export const fetcher = async (
  payload: EditRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {
    const validatePayload = quickEditRequestSchema.parse(payload);

    const response = await ky
      .post("/api/quick-edit", {
        json: validatePayload,
        signal,
        timeout: 30_000,
        retry: 0,
      })
      .json<EditResponse>();

    const validatedResponse = quickEditResponseSchema.parse(response);
    return validatedResponse.editedCode || null;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return null;
    }
    toast.error("Failed to fetch AI completion");
    return null;
  }
};
