import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 backdrop-blur-sm">
        <Link href="/" aria-label="Blue Ridge Homes home">
          <Image
            src="/brand/logo.png"
            alt="Blue Ridge Homes"
            width={220}
            height={72}
            className="h-12 w-auto brightness-0 invert"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          <a className="hover:text-white" href="#services">Services</a>
          <Link className="hover:text-white" href="/portfolio">Portfolio</Link>
          <a className="hover:text-white" href="#process">Process</a>
          <Link className="hover:text-white" href="/contact">Contact</Link>
        </nav>

        <Link
          href="/contact"
          className="rounded-full bg-[#C7A15B] px-5 py-2 text-sm font-semibold text-[#1D232A] shadow-sm hover:brightness-105"
        >
          Start the Conversation
        </Link>
      </div>
    </header>
  );
}
