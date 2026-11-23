import { serve } from "bun";

const TARGET = "https://generativelanguage.googleapis.com";
const PORT = 8085;

serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const targetUrl = TARGET + url.pathname + url.search;

    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("accept-encoding");

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body,
      // @ts-expect-error duplex
      duplex: "half",
    });

    const contentType = upstream.headers.get("content-type") || "";

    if (!contentType.includes("text/event-stream") || !upstream.body) {
      const respHeaders = new Headers(upstream.headers);
      respHeaders.delete("content-encoding");
      return new Response(upstream.body, {
        status: upstream.status,
        headers: respHeaders,
      });
    }

    const reader = upstream.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.length > 0) {
              controller.enqueue(encoder.encode(buffer));
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (let line of lines) {
            if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
              const jsonStr = line.slice(6).trim();
              try {
                const parsed = JSON.parse(jsonStr);
                let modified = false;

                if (Array.isArray(parsed.choices)) {
                  for (const choice of parsed.choices) {
                    const toolCalls = choice?.delta?.tool_calls;
                    if (Array.isArray(toolCalls)) {
                      for (let i = 0; i < toolCalls.length; i++) {
                        if (toolCalls[i].index === undefined) {
                          toolCalls[i].index = i;
                          modified = true;
                        }
                      }
                    }
                  }
                }

                if (modified) {
                  line = "data: " + JSON.stringify(parsed);
                }
              } catch {}
            }
            controller.enqueue(encoder.encode(line + "\n"));
          }
        }
      },
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    return new Response(stream, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
});

console.log(`Gemini OpenAI compatibility proxy running on port ${PORT}`);
