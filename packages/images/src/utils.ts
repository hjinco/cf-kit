export const createErrorResponse = (message: string, status: number) =>
  new Response(message, {
    status,
  });

export const createImageResponse = (
  body: ReadableStream,
  contentType: string
) =>
  new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      Vary: "Accept",
    },
  });
