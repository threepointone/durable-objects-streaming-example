import {
  Agent,
  AgentNamespace,
  getAgentByName,
  routeAgentRequest,
} from "@cloudflare/agents";
type Env = {
  Target1: AgentNamespace<Target1>;
  Target2: AgentNamespace<Target2>;
};

type Chunk = {
  id: string;
  content: string;
  done: boolean;
};

const decoder = new TextDecoder();

export class Target1 extends Agent<Env> {
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    switch (request.method) {
      case "GET":
        return new Response("Hello World");
      case "POST": {
        // this is a streaming POST
        // take every chunk and send it to the target2 agent
        const id = crypto.randomUUID();
        const stub = await getAgentByName(this.env.Target2, this.name);
        // we may rewrite this to use a BYOB reader for perf
        // https://github.com/lambrospetrou/tiddlyflare/blob/2f6cd98eab2d77f8319cca21922dea3a8ca41d9a/src/durable-objects.ts#L308
        const reader = request.body?.getReader();
        while (true) {
          const content = await reader?.read();

          stub.receive({
            id,
            content: decoder.decode(content?.value),
            done: content?.done || false,
          });

          if (content?.done) {
            break;
          }
        }
        return new Response("streamed to target 2");
      }
      default:
        return new Response("Not found", { status: 404 });
    }
  }
}

export class Target2 extends Agent<Env> {
  chunks: Record<string, string> = {};
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  onConnect() {
    // broadcast all available chunks
    for (const [id, content] of Object.entries(this.chunks)) {
      this.broadcast(JSON.stringify({ id, content, done: false }));
    }
  }
  receive(chunk: Chunk) {
    // if done is true, then delete the row
    if (chunk.done) {
      delete this.chunks[chunk.id];
    } else {
      this.chunks[chunk.id] ||= "";
      this.chunks[chunk.id] += chunk.content;
    }

    this.broadcast(JSON.stringify(chunk));
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
