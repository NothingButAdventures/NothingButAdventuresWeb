import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

interface Country {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
}

interface Continent {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  countries?: Country[];
}

interface Tour {
  _id: string;
  name: string;
  slug: string;
  tourCode: string;
  summary?: string;
  descriptionImage?: string;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  country?: {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
  };
}

async function getContinents(): Promise<Continent[]> {
  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.continents.getAll}?limit=100`, {
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

async function getToursForContinent(countryIds: string[]): Promise<Tour[]> {
  if (countryIds.length === 0) return [];

  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.tours.getAll}?limit=500`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch tours");

    const data = await res.json();
    const tours: Tour[] = data?.data?.tours || data?.data || [];
    const countryIdSet = new Set(countryIds);

    return tours.filter((tour) => {
      const tourCountryId = tour.country?._id || tour.country?.id;
      return !!tourCountryId && countryIdSet.has(tourCountryId);
    });
  } catch (error) {
    console.error("Error fetching tours:", error);
    return [];
  }
}

function stripHtml(text?: string) {
  return text?.replace(/<[^>]*>?/gm, "").trim() || "";
}

export default async function ContinentDestinationsPage({
  params,
}: {
  params: Promise<{ continent: string }>;
}) {
  const { continent: slug } = await params;
  const continents = await getContinents();
  const continent = continents.find((item) => item.slug === slug);

  if (!continent) {
    notFound();
  }

  const countries = continent.countries || [];
  const countryIds = countries
    .map((country) => country._id || country.id)
    .filter((id): id is string => Boolean(id));

  const tours = await getToursForContinent(countryIds);
  const cleanDescription =
    stripHtml(continent.description) ||
    "Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories.";

  return (
    <main className="min-h-screen w-full bg-[#f5f5f5] pb-24">
      <div className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-12 xl:px-16">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-[#3F3F42]">
          <Link href="/" className="hover:text-[#3F3F42] transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4 mx-1 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          <Link href="/destinations" className="hover:text-[#3F3F42] transition-colors">
            Destinations
          </Link>
          <svg className="w-4 h-4 mx-1 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          <span className="text-[#3F3F42] font-medium">{continent.name}</span>
        </nav>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div className="rounded-2xl bg-[#ededed] p-7 md:p-10">
            <h1 className="text-balance text-[42px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#3F3F42] md:text-[58px]">
              {continent.name}
            </h1>
            <p className="mt-8 max-w-[38ch] text-[18px] leading-[1.5] text-[#3F3F42]">
              {cleanDescription}
            </p>
            <Link
              href="/trips"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#3F3F42] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3F3F42]"
            >
              View all {continent.name} Tours
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">
                ↗
              </span>
            </Link>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[560px] lg:aspect-square lg:h-auto lg:min-h-[680px] xl:min-h-[760px]">
            <Image
              src={
                continent.image ||
                "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop"
              }
              alt={`${continent.name} destinations`}
              fill
              priority
              className="object-cover"
            />
          </div>
        </section>

        <section className="mt-14 md:mt-16">
          <span className="inline-block rounded-full bg-[#3F3F42] px-3 py-1 text-[11px] font-medium leading-none text-white">
            Destinations
          </span>
          <h2 className="mt-3 text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#3F3F42] md:text-[54px]">
            Popular destinations in {continent.name}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1.6fr)_minmax(250px,0.65fr)] xl:items-start">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {tours.length > 0 ? (
                tours.map((tour) => {
                  const cardImage =
                    tour.descriptionImage ||
                    tour.images?.find((img) => img.isPrimary)?.url ||
                    tour.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop";

                  return (
                    <article key={tour._id} className="overflow-hidden rounded-2xl border border-[#d6d6d6] bg-[#f8f8f8]">
                      <div className="relative h-[260px] w-full">
                        <Image
                          src={cardImage}
                          alt={tour.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="px-4 py-3">
                        <h3 className="text-[33px] font-semibold leading-[1.08] text-[#3F3F42]">
                          {tour.country?.name || tour.name}
                        </h3>
                        <p className="mt-2 overflow-hidden text-[16px] leading-[1.45] text-[#3F3F42] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] md:text-[17px]">
                          {stripHtml(tour.summary) ||
                            "40+ successful planned trips and immersive local experiences."}
                        </p>
                        <Link
                          href={`/trips/${tour.slug}/${tour.tourCode}`}
                          className="mt-3 inline-block text-[21px] font-medium text-[#3F3F42] transition-colors hover:text-[#3F3F42]/65"
                        >
                          Learn More about {tour.country?.name || tour.name}
                        </Link>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-[#d6d6d6] bg-[#f8f8f8] p-8 text-[20px] text-[#3F3F42]">
                  No tours found for this continent yet.
                </div>
              )}
            </div>

            <aside className="rounded-2xl bg-[#ededed] px-6 py-6 md:px-7 md:py-7">
              <h3 className="text-[42px] font-semibold leading-[1.1] text-[#3F3F42]">
                All Adventures in {continent.name}
              </h3>

              {countries.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[17px] leading-[1.35] text-[#3F3F42] marker:text-[#3F3F42]">
                  {countries.map((country) => (
                    <li key={country._id || country.id || country.name} className="list-disc">
                      <Link
                        href={country.slug ? `/destinations/${continent.slug}/${country.slug}` : `/destinations/${continent.slug}/${encodeURIComponent(country.name.toLowerCase())}`}
                        className="transition-colors hover:text-[#3F3F42]"
                      >
                        {country.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[17px] text-[#3F3F42]">No countries available for this continent yet.</p>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
