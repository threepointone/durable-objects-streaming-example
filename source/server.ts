type Env = {};

export default {
  async fetch(request: Request) {
    return new Response("Hello World");
  },
} satisfies ExportedHandler<Env>;
