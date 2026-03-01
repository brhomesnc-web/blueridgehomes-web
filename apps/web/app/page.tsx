export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3EFE7] text-[#1D232A]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="h-[78vh] w-full bg-[radial-gradient(ellipse_at_top,rgba(12,32,54,0.45),rgba(12,32,54,0.10)_45%,rgba(243,239,231,0)_75%)]" />
          <div className="absolute inset-0 h-[78vh] w-full bg-[linear-gradient(to_bottom,rgba(12,32,54,0.48),rgba(12,32,54,0.08),rgba(243,239,231,1))]" />
          {/* Temporary hero image placeholder */}
          <div className="absolute inset-0 h-[78vh] w-full bg-[url('/hero-placeholder.jpg')] bg-cover bg-center opacity-90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-16 md:pb-14 md:pt-20">
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1 className="mb-4 max-w-2xl font-serif text-5xl font-normal leading-[1.05] tracking-[-0.02em] text-white/95 md:text-7xl">
                Modern Mountain Living,
                <span className="block font-semibold text-white">Built with Integrity.</span>
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
                Custom homes and remodels across Western North Carolina—crafted with clear communication,
                careful planning, and exceptional finish work.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-[999px] bg-[#C7A15B] px-6 py-3 text-sm font-semibold text-[#1D232A] shadow-md transition-all duration-300 hover:scale-[1.02] hover:brightness-105"
                >
                  Request a Consultation
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-[1.02]"
                >
                  View Portfolio
                </a>
              </div>

              <ul className="mt-8 grid gap-3 text-sm text-white/85 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                  30+ Years in Western NC
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                  Fully Licensed & Insured
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                  Transparent Process
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                  Craftsmanship-First Finish
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#F3EFE7]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-3xl bg-white/70 shadow-sm ring-1 ring-black/10">
              <div className="grid grid-cols-2 gap-4 p-4 text-[#0C2036] md:grid-cols-5 md:p-5">
                <div className="text-sm font-semibold">30+ Years Experience</div>
                <div className="text-sm font-semibold">400+ Projects Completed</div>
                <div className="text-sm font-semibold">98% Client Satisfaction</div>
                <div className="text-sm font-semibold">Fully Licensed & Insured</div>
                <div className="text-sm font-semibold">NC License #56328</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMITMENT */}
      <section id="services" className="mx-auto max-w-6xl px-6 pb-16 pt-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-serif text-3xl text-[#0C2036] md:text-4xl">Our Commitment</h2>
            <p className="mt-4 text-[#3B434B]">
              A modern build experience with old-world accountability: clear scope, clear schedules, and clean work sites.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C7A15B]/20 ring-1 ring-[#C7A15B]/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                </span>
                <span className="text-sm font-semibold text-[#0C2036]">Transparent Process</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C7A15B]/20 ring-1 ring-[#C7A15B]/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                </span>
                <span className="text-sm font-semibold text-[#0C2036]">Clear Timelines</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C7A15B]/20 ring-1 ring-[#C7A15B]/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C7A15B]" />
                </span>
                <span className="text-sm font-semibold text-[#0C2036]">Dedicated Leadership</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-7">
            <div className="grid gap-5">
              <div className="aspect-[16/9] rounded-3xl bg-[linear-gradient(135deg,rgba(12,32,54,0.14),rgba(199,161,91,0.10))] shadow-sm ring-1 ring-black/5" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="aspect-[4/3] rounded-3xl bg-[linear-gradient(135deg,rgba(12,32,54,0.10),rgba(199,161,91,0.08))] shadow-sm ring-1 ring-black/5" />
                <div className="aspect-[4/3] rounded-3xl bg-[linear-gradient(135deg,rgba(12,32,54,0.08),rgba(199,161,91,0.12))] shadow-sm ring-1 ring-black/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="bg-[#E9E2D6]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-serif text-3xl text-[#0C2036] md:text-4xl">Our Proven Process</h2>
              <p className="mt-3 max-w-2xl text-[#3B434B]">
                A straightforward path from vision to completion—built around communication, craftsmanship, and care.
              </p>
            </div>
            <a
              href="#contact"
              className="hidden rounded-full bg-[#0C2036] px-5 py-2 text-sm font-semibold text-white hover:brightness-110 md:inline-flex"
            >
              Get a Quote
            </a>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            <Step n="01" title="Vision" text="Talk goals, budget range, and timeline. We align expectations early." />
            <Step n="02" title="Design" text="Plans, selections, and scope clarity—so there are no surprises." />
            <Step n="03" title="Build" text="Trade coordination, inspections, and quality checks throughout." />
            <Step n="04" title="Deliver" text="Punch list, walkthrough, and handoff you can feel great about." />
          </div>
        </div>
      </section>

      {/* PORTFOLIO PREVIEW */}
      <section id="portfolio" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl text-[#0C2036] md:text-4xl">Featured Work</h2>
            <p className="mt-3 max-w-2xl text-[#3B434B]">
              A selection of recent custom homes and remodels across Asheville and Western North Carolina.
            </p>
          </div>
          <a
            href="#"
            className="rounded-full border border-[#0C2036]/20 bg-white px-5 py-2 text-sm font-semibold text-[#0C2036] hover:bg-[#0C2036]/5"
          >
            View Full Portfolio
          </a>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-12">
          <PortfolioCard className="md:col-span-7" title="Modern Mountain Retreat" subtitle="Asheville, NC" />
          <PortfolioCard className="md:col-span-5" title="Kitchen Remodel" subtitle="Weaverville, NC" />
          <PortfolioCard className="md:col-span-5" title="Lakeside Addition" subtitle="Lake Lure, NC" />
          <PortfolioCard className="md:col-span-7" title="Craftsman Exterior" subtitle="Black Mountain, NC" />
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-[#0C2036]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h2 className="font-serif text-3xl text-white md:text-5xl">Let’s Build Something Enduring.</h2>
              <p className="mt-4 max-w-xl text-white/80">
                Tell us about your project and we’ll follow up to schedule a consultation. No pressure—just clarity.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:+18285551234"
                  className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
                >
                  Call (828) 555-1234
                </a>
                <a
                  href="mailto:info@brhomesnc.com"
                  className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
                >
                  Email info@brhomesnc.com
                </a>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
                <div className="text-sm font-semibold text-[#0C2036]">Request a Consultation</div>
                <p className="mt-1 text-sm text-[#3B434B]">We’ll respond within 1 business day.</p>

                <form className="mt-5 space-y-3">
                  <input
                    className="w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C7A15B]/60"
                    placeholder="Full Name"
                  />
                  <input
                    className="w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C7A15B]/60"
                    placeholder="Phone"
                  />
                  <input
                    className="w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C7A15B]/60"
                    placeholder="Email"
                  />
                  <textarea
                    className="h-24 w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C7A15B]/60"
                    placeholder="Briefly describe your project"
                  />
                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#C7A15B] px-4 py-3 text-sm font-semibold text-[#1D232A] hover:brightness-105"
                  >
                    Send Request
                  </button>
                  <div className="text-xs text-[#6B7280]">
                    By submitting, you agree to be contacted about your project.
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/60">
            © {new Date().getFullYear()} Blue Ridge Homes • Asheville, NC
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="text-sm font-semibold text-[#0C2036]">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-[#3B434B]">{text}</div>
    </div>
  );
}

function ImageCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="aspect-[4/3] w-full bg-[linear-gradient(135deg,rgba(12,32,54,0.08),rgba(199,161,91,0.08))]" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="text-sm font-semibold text-[#0C2036]">{title}</div>
        <div className="mt-1 text-sm text-[#3B434B]">{subtitle}</div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,32,54,0.10),transparent_45%)]" />
      </div>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-[#C7A15B]">{n}</div>
        <div className="h-1.5 w-1.5 rounded-full bg-[#0C2036]/30" />
      </div>
      <div className="mt-3 text-lg font-semibold text-[#0C2036]">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-[#3B434B]">{text}</div>
    </div>
  );
}

function PortfolioCard({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5",
        className ?? "",
      ].join(" ")}
    >
      <div className="aspect-[16/10] w-full bg-[linear-gradient(135deg,rgba(12,32,54,0.12),rgba(199,161,91,0.10))]" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="text-lg font-semibold text-[#0C2036]">{title}</div>
        <div className="mt-1 text-sm text-[#3B434B]">{subtitle}</div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,32,54,0.16),transparent_55%)]" />
      </div>
    </div>
  );
}














