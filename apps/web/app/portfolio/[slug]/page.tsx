import Link from "next/link";
import PageWrapper from "@/components/site/PageWrapper";
import Gallery from "@/components/Gallery";

type PortfolioDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const projectTitle = params.slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <PageWrapper className="min-h-screen max-w-4xl bg-[#F3EFE7] text-[#1D232A]">
      <Link className="text-sm font-semibold text-[#0C2036] hover:underline" href="/portfolio">
        Back to Portfolio
      </Link>

      <h1 className="mt-4 font-serif text-4xl text-[#0C2036] md:text-5xl">{projectTitle}</h1>
      <p className="mt-3 text-[#3B434B]">Western North Carolina</p>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
        <p className="text-[#3B434B]">
          Placeholder project details. This page will later include full galleries, scope, timeline, and material
          selections for the selected project.
        </p>
      </div>
    </PageWrapper>
  );
}
