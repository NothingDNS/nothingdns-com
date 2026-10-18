import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

// Keep previously shared image URLs working alongside the canonical /og.png.
export async function GET() {
  const image = await readFile(join(process.cwd(), "public/og.png"));
  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/png" },
  });
}
