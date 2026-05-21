import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

interface Continent {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  countries?: Array<{ _id?: string; id?: string; name: string }>;
}

async function getContinents() {
  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.continents.getAll}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch continents");
    const data = await res.json();
    return data?.data?.continents || [];
  } catch (error) {
    console.error("Error fetching continents:", error);
    return [];
  }
}

export default async function DestinationsPage() {
  const continents = await getContinents();
  const heroCtaSlug = continents[0]?.slug;

  return (
    <main className="min-h-screen w-full bg-[#f5f5f5] pb-24">
      <div className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-12 xl:px-16">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-[#4B5563]">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-[#9CA3AF]">/</span>
          <span className="text-[#1F2937] font-medium">Destinations</span>
        </nav>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div className="rounded-2xl bg-[#ededed] p-7 md:p-10">
            <h1 className="text-balance text-[42px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#171717] md:text-[58px]">
              Travel
              <br />
              Destinations
            </h1>
            <p className="mt-8 max-w-[38ch] text-[18px] leading-[1.5] text-[#3f3f3f]">
              Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories.
            </p>
            <Link
              href={heroCtaSlug ? `/destinations/${heroCtaSlug}` : "/trips"}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#101010] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              View all Asia Tours
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">↗</span>
            </Link>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[560px] lg:aspect-square lg:h-auto lg:min-h-[680px] xl:min-h-[760px]">
            <Image
              src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop"
              alt="Travel destinations"
              fill
              priority
              className="object-cover"
            />
          </div>
        </section>

        <div className="mt-16 space-y-14 md:mt-20 md:space-y-16">
        {continents.length > 0 ? (
          continents.map((continent: Continent) => {
            const cleanDescription = continent.description?.replace(/<[^>]*>?/gm, "").trim();
            const countries = continent.countries || [];
            const continentHref = continent.slug ? `/destinations/${continent.slug}` : "/destinations";

            return (
              <section key={continent._id} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
                <div>
                  <span className="inline-block rounded-full bg-[#111111] px-3 py-1 text-[11px] font-medium leading-none text-white">
                    Destinations
                  </span>
                  <h2 className="mt-3 text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#151515]">
                    <Link
                      href={continentHref}
                      className="transition-colors hover:text-black/75 hover:underline hover:underline-offset-4"
                    >
                      {continent.name} Adventures
                    </Link>
                  </h2>
                  <p className="mt-5 max-w-[52ch] text-[22px] leading-[1.52] text-[#333333]">
                    {cleanDescription ||
                      "Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories."}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#ededed] px-7 py-7 md:px-9 md:py-8">
                  {countries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                      {countries.map((country) => (
                        <p key={country._id || country.id || country.name} className="text-[21px] font-normal leading-[1.35] text-[#6d6d6d]">
                          {country.name}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[18px] text-[#6d6d6d]">No countries available for this continent yet.</p>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white py-16 text-center text-lg text-gray-500">
            No destinations found.
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
