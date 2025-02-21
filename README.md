![image](https://github.com/user-attachments/assets/c5afd085-141b-4c36-a952-cb11b3dc0b37)


```bash
npm install
npm start
```

This is an example to show some streaming capabilities of Cloudflare Durable Objects.

In this example, we have 2 servers, a source and a target. We use a form to submit a query to the source server. The source server makes an LLM request based on the query, and does a streaming POST to the target server. The Target server sends on this streaming post to a Durable Object Target 1. Target 1 then streams this response to Target 2, by calling RPC calls. Target 2 then broadcasts the response to all browser clients that are connected.

```
Form Input
    |
    v
Source Server
    |
    v
Target Server
    |
    v
Target 1 DO
    |
    v
Target 2 DO
    |
    v
Browser Clients
```
