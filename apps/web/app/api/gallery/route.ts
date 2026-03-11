import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const project = searchParams.get("project");

  if (!project) {
    return NextResponse.json({ error: "Missing project parameter" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public/optimized", project);

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith("-1200.webp"));

  const images = files.map(file => {

    const base = file.replace("-1200.webp", "");

    return {
      full: `/optimized/${project}/${base}.webp`,
      large: `/optimized/${project}/${base}-1200.webp`,
      medium: `/optimized/${project}/${base}-768.webp`,
      small: `/optimized/${project}/${base}-480.webp`
    };

  });

  return NextResponse.json(images);

}
