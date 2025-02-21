import { Agent, AgentNamespace } from "@cloudflare/agents";
type Env = {
  Target1: AgentNamespace<Target1>;
  Target2: AgentNamespace<Target2>;
};

export class Target1 extends Agent<Env> {}

export class Target2 extends Agent<Env> {}

export default {
  async fetch(request: Request) {
    return new Response("Hello World");
  },
} satisfies ExportedHandler<Env>;
