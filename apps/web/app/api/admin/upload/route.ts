import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const validKey = apiKey && apiKey === process.env.BLOG_AGENT_API_KEY;
  if (!validKey && !(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "blog";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Sanitize filename
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");

  const uploadDir = path.join(process.env.PUBLIC_DIR || "/var/www/brhomes/apps/web/public", "optimized", folder);
  fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const publicPath = `/optimized/${folder}/${safeName}`;
  return NextResponse.json({ success: true, path: publicPath });
}
