
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[680px] items-center overflow-hidden border-b border-white/10">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#111315] via-[#111315]/90 to-[#111315]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-[#111315]/20" />

      <div className="container relative z-10 py-24">
        <div className="max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-10 bg-[#a1ad7c]" />
            <span className="eyebrow">
              INTRODUCING VANTROX
            </span>
          </div>

          <h1 className="text-6xl font-black leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
            PRECISION.
            <br />
            PERFORMANCE.
            <br />
            <span className="text-[#a1ad7c]">PLAY.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-[#a4aaa1] sm:text-lg">
            Discover our featured airsoft product.
            Explore its details, specifications and availability,
            and get in touch with our team for enquiries.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#product"
              className="bg-[#a1ad7c] px-8 py-4 text-sm font-bold tracking-wider text-[#111315] transition hover:bg-[#b5c18f]"
            >
              EXPLORE PRODUCT →
            </Link>

            <Link
              href="#contact"
              className="border border-white/20 px-8 py-4 text-sm font-bold tracking-wider transition hover:border-[#a1ad7c] hover:text-[#a1ad7c]"
            >
              CONTACT US
            </Link>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-4 text-xs tracking-[3px] text-[#a4aaa1]">
          <span className="h-px w-12 bg-[#a1ad7c]" />
          PRECISION. PERFORMANCE. PLAY.
        </div>
      </div>
    </section>
  );
}
