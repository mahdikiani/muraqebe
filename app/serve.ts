/**
 * Serve built static files from dist/ (for Docker/production).
 * SPA: unknown paths return index.html.
 */
const DIST = "./dist";
const PORT = Number(process.env.PORT) || 3000;

const mimes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function getMime(pathname: string): string {
  const ext = pathname.slice(pathname.lastIndexOf("."));
  return mimes[ext] ?? "application/octet-stream";
}

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const pathname = new URL(req.url).pathname;
    const path = pathname === "/" ? "/index.html" : pathname;
    let file = Bun.file(`${DIST}${path}`);
    if (!(await file.exists())) {
      file = Bun.file(`${DIST}/index.html`);
    }
    return new Response(file, {
      headers: {
        "Content-Type": getMime(path),
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
});

console.log(`مراقبه رمضان: http://localhost:${server.port}`);
