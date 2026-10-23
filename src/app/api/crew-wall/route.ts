import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const BUCKET = "crew-wall-photos";
const MAX_PHOTO = 2 * 1024 * 1024;
const MAX_REQUEST = MAX_PHOTO + 32 * 1024;
const headers = { "Cache-Control": "no-store, private" };

function backend() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (process.env.CREW_WALL_ENABLED !== "true" || !url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function reply(body: object, status = 200) { return NextResponse.json(body, { status, headers }); }

export async function GET() {
  const client = backend();
  if (!client) return reply({ configured: false, posts: [] });
  const { data, error } = await client.from("community_submissions")
    .select("id,author,title,body,port,photo_path,created_at")
    .eq("status", "approved").order("created_at", { ascending: false }).limit(6);
  if (error) return reply({ configured: false, posts: [], error: "unavailable" }, 503);
  const posts = await Promise.all((data ?? []).map(async post => {
    let photoUrl: string | null = null;
    // Never sign an arbitrary path/URL from a submission or expose pending photos.
    if (post.photo_path === `${post.id}.jpg`) {
      const result = await client.storage.from(BUCKET).createSignedUrl(post.photo_path, 600);
      photoUrl = result.data?.signedUrl ?? null;
    }
    return { id: post.id, author: post.author, title: post.title, body: post.body, port: post.port, created_at: post.created_at, photoUrl };
  }));
  return reply({ configured: true, posts });
}

async function readForm(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("multipart/form-data")) throw new Error("invalid");
  if (Number(req.headers.get("content-length")) > MAX_REQUEST) throw new Error("large");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST) { await reader.cancel(); throw new Error("large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
  return new Response(buffer, { headers: { "Content-Type": req.headers.get("content-type")! } }).formData();
}

export async function POST(req: Request) {
  // Public, read-only operation; avoids the PWA worker's cache-first GET behavior.
  if (new URL(req.url).searchParams.get("view") === "approved") return GET();
  const client = backend();
  if (!client) return reply({ error: "unavailable" }, 503);
  const origin = req.headers.get("origin");
  if (!origin || origin !== new URL(req.url).origin) return reply({ error: "origin" }, 403);
  let form: FormData;
  try { form = await readForm(req); }
  catch (error) { return reply({ error: "invalid" }, error instanceof Error && error.message === "large" ? 413 : 400); }
  const text = (key: string) => typeof form.get(key) === "string" ? (form.get(key) as string).trim() : "";
  const author = text("author"), title = text("title"), body = text("body"), port = text("port");
  const photo = form.get("photo");
  if (!author || author.length > 80 || !title || title.length > 140 || body.length > 2000 || port.length > 100 || (!body && !(photo instanceof File))) return reply({ error: "invalid" }, 400);
  let bytes: Uint8Array | null = null;
  if (photo !== null) {
    if (!(photo instanceof File) || photo.type !== "image/jpeg" || photo.size < 4 || photo.size > MAX_PHOTO) return reply({ error: "photo" }, 400);
    bytes = new Uint8Array(await photo.arrayBuffer());
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) return reply({ error: "photo" }, 400);
  }
  const id = randomUUID();
  const photoPath = bytes ? `${id}.jpg` : null;
  // A database lock/rate limit works across serverless instances. Raw IPs are not stored.
  const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const fingerprint = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${new Date().toISOString().slice(0, 10)}:${ip}`).digest("hex");
  const { error } = await client.rpc("submit_community_story", { p_id: id, p_author: author, p_title: title, p_body: body, p_port: port || null, p_photo_path: photoPath, p_fingerprint: fingerprint });
  if (error) return reply({ error: error.message.includes("rate_limit") ? "rate_limit" : "unavailable" }, error.message.includes("rate_limit") ? 429 : 503);
  if (bytes && photoPath) {
    const upload = await client.storage.from(BUCKET).upload(photoPath, bytes, { contentType: "image/jpeg", upsert: false });
    if (upload.error) {
      await client.from("community_submissions").delete().eq("id", id).eq("status", "pending");
      return reply({ error: "photo" }, 503);
    }
  }
  return reply({ id, status: "pending" }, 201);
}
