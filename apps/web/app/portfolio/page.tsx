import Link from "next/link";
import PageWrapper from "@/components/site/PageWrapper";

const projects = [
  { title: "Modern Mountain Retreat", location: "Asheville, NC", slug: "modern-mountain-retreat" },
  { title: "Kitchen Remodel", location: "Weaverville, NC", slug: "kitchen-remodel" },
  { title: "Lakeside Addition", location: "Lake Lure, NC", slug: "lakeside-addition" },
  { title: "Craftsman Exterior", location: "Black Mountain, NC", slug: "craftsman-exterior" },
  { title: "Hillside New Build", location: "Hendersonville, NC", slug: "hillside-new-build" },
  { title: "Whole Home Update", location: "Arden, NC", slug: "whole-home-update" },
];

export default function PortfolioPage() {
  return (
    <PageWrapper className="min-h-screen bg-[#F3EFE7] text-[#1D232A]">
      <h1 className="font-serif text-4xl text-[#0C2036] md:text-5xl">Portfolio</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/portfolio/${project.slug}`}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:bg-[#F7F4EF]"
          >
            <div className="text-lg font-semibold text-[#0C2036]">{project.title}</div>
            <div className="mt-1 text-sm text-[#3B434B]">{project.location}</div>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}
