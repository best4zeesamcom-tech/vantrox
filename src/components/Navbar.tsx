
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111315]/95 backdrop-blur-xl">
      <nav className="container flex h-20 items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-[5px]">
          VANTROX<span className="text-[#a1ad7c]">.</span>
        </Link>

        <div className="hidden items-center gap-9 text-sm text-[#a4aaa1] md:flex">
          <Link href="#product" className="transition hover:text-white">
            Product
          </Link>
          <Link href="#about" className="transition hover:text-white">
            About
          </Link>
          <Link href="#contact" className="transition hover:text-white">
            Contact
          </Link>
        </div>

        <Link
          href="#contact"
          className="border border-[#a1ad7c] px-5 py-3 text-xs font-bold tracking-wider text-[#a1ad7c] transition hover:bg-[#a1ad7c] hover:text-[#111315]"
        >
          MAKE AN ENQUIRY
        </Link>
      </nav>
    </header>
  );
}
