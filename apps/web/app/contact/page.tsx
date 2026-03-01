import Link from "next/link";
import PageWrapper from "@/components/site/PageWrapper";

export default function ContactPage() {
  return (
    <PageWrapper className="min-h-screen max-w-4xl bg-[#F3EFE7] text-[#1D232A]">
      <h1 className="font-serif text-4xl text-[#0C2036] md:text-5xl">Contact</h1>

      <p className="mt-4 text-[#3B434B]">Phone: (828) 555-1234</p>
      <p className="text-[#3B434B]">Email: info@brhomesnc.com</p>

      <form className="mt-8 space-y-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/10">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          className="w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none"
        />
        <textarea
          name="message"
          placeholder="Message"
          className="h-28 w-full rounded-xl border border-black/10 bg-[#F7F4EF] px-4 py-3 text-sm outline-none"
        />
        <button
          type="button"
          className="rounded-full bg-[#C7A15B] px-5 py-2 text-sm font-semibold text-[#1D232A] shadow-sm hover:brightness-105"
        >
          Send Message
        </button>
      </form>

      <div className="mt-6">
        <Link className="text-sm font-semibold text-[#0C2036] hover:underline" href="/">
          Back to Home
        </Link>
      </div>
    </PageWrapper>
  );
}
