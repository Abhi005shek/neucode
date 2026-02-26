import { createOpenAI, openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { firecrawl } from "@/lib/firecrawl";
import { auth } from "@clerk/nextjs/server";

const quickEditSchema = z.object({
  editedCode: z
    .string()
    .describe("The edited version of selected code based on a instruction"),
});

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

// export async function POST(req: Request) {
//   try {
//     const { selectedCode, fullCode, instruction } = await req.json();

//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Selected code is required" },
//         { status: 400 },
//       );
//     }

//     if (!selectedCode) {
//       return NextResponse.json(
//         { error: "Selected code is required" },
//         { status: 400 },
//       );
//     }

//     if (!instruction) {
//       return NextResponse.json(
//         { error: "Instruction is required" },
//         { status: 400 },
//       );
//     }

//     const urls: string[] = instruction.match(URL_REGEX) || [];
//     let documentationContext = "";

//     if (urls.length > 0) {
//       const scrapedResults = await Promise.all(
//         urls.map(async (url) => {
//           try {
//             const result = await firecrawl.scrape(url, {
//               formats: ["markdown"],
//             });
//             if (result.markdown) {
//               return `<doc url="${url}">${result.markdown}</doc>`;
//             }

//             return null;
//           } catch (err) {
//             return null;
//           }
//         }),
//       );

//       const validResults = scrapedResults.filter(Boolean);
//       if (validResults.length > 0) {
//         documentationContext = `<documentation>\n${validResults.join("\n\n")}</documentation>`;
//       }

//       const prompt = QUICK_EDIT_PROMPT.replace("{selectedCode}", selectedCode)
//         .replace("{fullCode}", fullCode || "")
//         .replace("{instruction}", instruction)
//         .replace("{documentation}", documentationContext);

//       const groq = createOpenAI({
//         baseURL: "https://api.groq.com/openai/v1",
//         apiKey: process.env.GROQ_API_KEY!,
//       });

//       const  {output} = await generateText({
//         model: groq("qwen/qwen3-32b"),
//         prompt,
//       });

//       console.log("Output", output)

//       return NextResponse.json({ editedCode: output }, { status: 200 });
//     }
//   } catch (err) {
//     console.log("Error in Quick Edit ☠️", err);
//     return NextResponse.json(
//       { error: "Failed to generate edit" },
//       { status: 500 },
//     );
//   }
// }

export async function POST(req: Request) {
  try {
    const { selectedCode, fullCode, instruction } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!selectedCode) {
      return NextResponse.json(
        { error: "Selected code is required" },
        { status: 400 },
      );
    }

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction is required" },
        { status: 400 },
      );
    }

    const urls: string[] = instruction.match(URL_REGEX) || [];
    let documentationContext = "";

    if (urls.length > 0) {
      const scrapedResults = await Promise.all(
        urls.map(async (url) => {
          try {
            const result = await firecrawl.scrape(url, {
              formats: ["markdown"],
            });
            if (result.markdown) {
              return `<doc url="${url}">${result.markdown}</doc>`;
            }
            return null;
          } catch {
            return null;
          }
        }),
      );

      const validResults = scrapedResults.filter(Boolean) as string[];
      if (validResults.length > 0) {
        documentationContext = `<documentation>\n${validResults.join(
          "\n\n",
        )}</documentation>`;
      }
    }

    const prompt = QUICK_EDIT_PROMPT.replace("{selectedCode}", selectedCode)
      .replace("{fullCode}", fullCode || "")
      .replace("{instruction}", instruction)
      .replace("{documentation}", documentationContext);

    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY!,
    });

    const { text } = await generateText({
      model: groq("qwen/qwen3-32b"),
      prompt,
    });

    return NextResponse.json({ editedCode: text }, { status: 200 });
  } catch (err) {
    console.log("Error in Quick Edit ☠️", err);
    return NextResponse.json(
      { error: "Failed to generate edit" },
      { status: 500 },
    );
  }
}
