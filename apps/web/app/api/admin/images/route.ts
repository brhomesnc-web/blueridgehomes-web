import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

function checkAuth(request: Request): Promise<boolean> | boolean {
  const key = request.headers.get("x-api-key");
  if (key && key === process.env.BLOG_AGENT_API_KEY) return true;
  return getSession();
}

export async function GET(request: Request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const optimizedDir = path.join(process.env.PUBLIC_DIR || "/var/www/brhomes/apps/web/public", "optimized");
  const images: { folder: string; path: string; name: string }[] = [];

  if (!fs.existsSync(optimizedDir)) {
    return NextResponse.json({ images: [] });
  }

  const folderNames = fs.readdirSync(optimizedDir).filter((f) =>
    fs.statSync(path.join(optimizedDir, f)).isDirectory()
  );

  const folders: Record<string, string[]> = {};

  for (const folder of folderNames) {
    const folderPath = path.join(optimizedDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) =>
      /\.(jpg|jpeg|png|webp|jfif)$/i.test(f)
    );
    folders[folder] = files;
    for (const file of files) {
      images.push({
        folder,
        path: `/optimized/${folder}/${file}`,
        name: file,
      });
    }
  }

  return NextResponse.json({ images, folders });
}
