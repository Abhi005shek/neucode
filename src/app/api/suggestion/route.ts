import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
// import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";

// const suggestionSchema = z.object({
//   suggestion: z
//     .string()
//     .describe(
//       "The code to insert to cursor, or empty string if no completion needed",
//     ),
// });

// const SUGGESTION_PROMPT = `You are a code suggestion assistant.

// <context>
// <file_name>{fileName}</file_name>
// <previous_lines>
// {previousLines}
// </previous_lines>
// <current_line number="{lineNumber}">{currentLine}</current_line>
// <before_cursor>{textBeforeCursor}</before_cursor>
// <after_cursor>{textAfterCursor}</after_cursor>
// <next_lines>
// {nextLines}
// </next_lines>
// <full_code>
// {code}
// </full_code>
// </context>

// <instructions>
// Follow these steps IN ORDER:

// 1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.

// 2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.

// 3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.

// Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
// </instructions>`;

const SUGGESTION_PROMPT = `You are an AI code completion engine.

<context>
<file_name>{fileName}</file_name>

<previous_lines>
{previousLines}
</previous_lines>

<current_line number="{lineNumber}">
{currentLine}
</current_line>

<before_cursor>
{textBeforeCursor}
</before_cursor>

<after_cursor>
{textAfterCursor}
</after_cursor>

<next_lines>
{nextLines}
</next_lines>
</context>

<rules>
- You are performing prefix-based code completion.
- The text inside <before_cursor> is already written.
- Continue writing EXACTLY from the end of <before_cursor>.
- The first token you generate must be a valid continuation of the last token in <before_cursor>.
- Never restart the line.
- Never generate imports.
- Never generate unrelated top-level code.
- Generate the shortest valid continuation.
- Output plain text only.
- No explanations.
</rules>`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized!! Failed to generate suggestion!",
        },
        {
          status: 403,
        },
      );
    }

    const {
      fileName,
      code,
      currentLine,
      previousLines,
      textBeforeCursor,
      textAfterCursor,
      nextLines,
      lineNumber,
    } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const MAX_CONTEXT_LINES = 250;

    const codeLines = code.split("\n");

    // Take last 250 lines (most relevant for cursor-based completion)
    const trimmedCode =
      codeLines.length > MAX_CONTEXT_LINES
        ? codeLines.slice(-MAX_CONTEXT_LINES).join("\n")
        : code;

    const prompt = SUGGESTION_PROMPT.replace("{fileName}", fileName)
      .replace("{code}", trimmedCode)
      .replace("{previousLines}", previousLines || "")
      .replace("{currentLine}", currentLine)
      .replace("{textBeforeCursor}", textBeforeCursor)
      .replace("{textAfterCursor}", textAfterCursor)
      .replace("{nextLines}", nextLines || "")
      .replace("{lineNumber}", lineNumber.toString());

    // const { output } = await generateText({
    //   model: google("gemini-3.0-flash"),
    //   output: Output.object({ schema: suggestionSchema }),
    //   prompt,
    // });

    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY!,
    });

    const { output } = await generateText({
      model: groq("qwen/qwen3-32b"),
      // output: Output.object({ schema: suggestionSchema }),
      prompt,
    });

    return NextResponse.json({ suggestion: output });
  } catch (err) {
    console.log("suggestion error: ☠️", err);
    return NextResponse.json(
      {
        error: "Failed to generate suggestion",
      },
      { status: 500 },
    );
  }
}
