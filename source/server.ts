import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

type Env = {
  OPENAI_API_KEY: string;
};

const targetServer = "http://localhost:8788";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    switch (request.method) {
      case "POST": {
        const { query } = await request.json<{ query: string }>();

        if (!query) {
          return new Response("No query provided", { status: 400 });
        }

        const openai = createOpenAI({
          apiKey: env.OPENAI_API_KEY,
        });

        const result = streamText({
          model: openai("gpt-4o"),
          system: "You are a helpful assistant.",
          messages: [{ role: "user", content: query }],
        });

        // don't block on the fetch to the target server
        ctx.waitUntil(
          fetch(`${targetServer}${url.pathname}`, {
            method: "POST",
            body: result.toTextStreamResponse().body,
          })
        );

        return new Response("thanks!");
      }

      default:
        return new Response("Not found", { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
