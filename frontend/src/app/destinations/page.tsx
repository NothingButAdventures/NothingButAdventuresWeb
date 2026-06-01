import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

interface Country {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  image?: string;
  shortDescription?: string;
}

interface Continent {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  countries?: Country[];
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
  const heroCtaName = continents[0]?.name || "Asia";

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

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] text-balance">
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
              View all {heroCtaName} Tours
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">↗</span>
            </Link>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[560px] lg:aspect-square lg:h-auto lg:min-h-[680px] xl:min-h-[760px]">
            <Image
              src={continents[0]?.image || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop"}
              alt="Travel destinations"
              fill
              priority
              className="object-cover"
            />
          </div>
        </section>

        <div className="mt-16 space-y-16 md:mt-20">
          {continents.length > 0 ? (
            continents.map((continent: Continent) => {
              const cleanDescription = continent.description?.replace(/<[^>]*>?/gm, "").trim();
              const countries = continent.countries || [];
              const continentHref = continent.slug ? `/destinations/${continent.slug}` : "/destinations";

              const popularCountries = countries.slice(0, 4);
              const remainingCountries = countries.slice(4);

              return (
                <section key={continent._id} className="border-b border-gray-200 pb-16 last:border-b-0 space-y-8">
                  {/* Continent Heading and Description */}
                  <div className="max-w-4xl">
                    <span className="inline-block rounded-full bg-[#111111] px-3 py-1 text-[11px] font-medium leading-none text-white">
                      Destinations
                    </span>
                    <h2 className="mt-3 text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#151515] md:text-[52px]">
                      <Link
                        href={continentHref}
                        className="transition-colors hover:text-black/75 hover:underline hover:underline-offset-4"
                      >
                        {continent.name} Adventures
                      </Link>
                    </h2>
                    <p className="mt-5 text-[20px] md:text-[22px] leading-[1.52] text-[#333333]">
                      {cleanDescription ||
                        "Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories."}
                    </p>
                  </div>

                  {/* Country Cards Grid */}
                  {countries.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {popularCountries.map((country) => {
                          const linkHref = `/destinations/${continent.slug}/${country.slug}`;
                          const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop";

                          return (
                            <Link
                              key={country._id || country.id || country.slug}
                              href={linkHref}
                              className="group block cursor-pointer"
                            >
                              <div className="relative w-full aspect-[4/5] rounded-[20px] overflow-hidden shadow-sm">
                                <img
                                  src={country.image || fallbackImage}
                                  alt={country.name}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                />
                              </div>

                              {/* Content Below Card Image */}
                              <div className="mt-3 px-1">
                                <h3 className="text-[#1a1a1a] text-[20px] font-bold leading-tight group-hover:text-black transition-colors mb-1">
                                  {country.name}
                                </h3>
                                <p className="text-[#5b5b5b] text-[14px] font-medium leading-normal">
                                  {country.shortDescription || "Palaces, forts & deserts"}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Remaining Countries list in 6 columns if more than 4 */}
                      {remainingCountries.length > 0 && (
                        <details className="group pt-4 outline-none">
                          <summary className="list-none flex items-center gap-2 text-[15px] font-semibold text-gray-500 hover:text-black uppercase tracking-wider cursor-pointer select-none transition-colors duration-150 outline-none">
                            <span>More Destinations in {continent.name}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="transition-transform duration-200 group-open:rotate-180"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </summary>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
                            {remainingCountries.map((country) => {
                              const linkHref = `/destinations/${continent.slug}/${country.slug}`;
                              const fallbackImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop";

                              return (
                                <Link
                                  key={country._id || country.id || country.slug}
                                  href={linkHref}
                                  className="group block cursor-pointer"
                                >
                                  <div className="relative w-full aspect-[4/5] rounded-[20px] overflow-hidden shadow-sm">
                                    <img
                                      src={country.image || fallbackImage}
                                      alt={country.name}
                                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                    />
                                  </div>

                                  {/* Content Below Card Image */}
                                  <div className="mt-3 px-1">
                                    <h3 className="text-[#1a1a1a] text-[18px] font-bold leading-tight group-hover:text-black transition-colors mb-1">
                                      {country.name}
                                    </h3>
                                    <p className="text-[#5b5b5b] text-[13px] font-medium leading-normal">
                                      {country.shortDescription || "Palaces, forts & deserts"}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </div>
                  ) : (
                    <p className="text-[18px] text-[#6d6d6d]">No countries available for this continent yet.</p>
                  )}
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
