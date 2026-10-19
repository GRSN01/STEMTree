import Anthropic from "@anthropic-ai/sdk";
import type { Filters } from "./types.ts";

const MODEL = "claude-sonnet-5-5";

/** Turn a plain-English request into structured search filters via tool use. */
export async function parseQuery(query: string): Promise<Filters> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    tools: [
      {
        name: "set_filters",
        description: "Set house search filters. Omit anything the user did not specify.",
        input_schema: {
          type: "object",
          properties: {
            maxPrice: { type: "number", description: "USD" },
            minBeds: { type: "number" },
            minBaths: { type: "number" },
            minSqft: { type: "number" },
            city: { type: "string" },
            zip: { type: "string" },
          },
        },
      },
    ],
    tool_choice: { type: "tool", name: "set_filters" },
    messages: [{ role: "user", content: query }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  return block && block.type === "tool_use" ? (block.input as Filters) : {};
}
