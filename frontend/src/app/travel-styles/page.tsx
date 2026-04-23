import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

interface TravelStyle {
  _id: string;
  name: string;
  slug?: string;
  url?: string;
  image?: string;
  description?: string;
  shortDescription?: string;
  color?: string;
  detailed?: {
    content?: string;
  };
  sections?: {
    intro?: {
      title?: string;
      bullets?: string[];
    };
  };
}

async function getTravelStyles() {
  try {
    const res = await fetch(`${api.baseURL}${api.endpoints.travelStyles.getAll}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch travel styles");
    const data = await res.json();
    return data?.data?.travelStyles || [];
  } catch (error) {
    console.error("Error fetching travel styles:", error);
    return [];
  }
}

function stripHtml(value?: string) {
  return (value || "").replace(/<[^>]*>?/gm, "").trim();
}

function getStyleBullets(style: TravelStyle) {
  const sectionBullets = style.sections?.intro?.bullets?.filter(Boolean) || [];
  if (sectionBullets.length > 0) {
    return sectionBullets.slice(0, 5);
  }

  const detailHtml = style.detailed?.content || "";
  const liMatches = [...detailHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  if (liMatches.length > 0) {
    return liMatches.slice(0, 5);
  }

  return [
    "Local-led immersive experiences",
    "Authentic stays and local meals",
    "Small groups with meaningful pace",
    "Hands-on cultural traditions",
    "Story-rich adventures",
  ];
}

function getTravelStyleHref(style?: TravelStyle) {
  if (style?.url && style.url.trim() !== "") {
    return style.url.trim();
  }
  return "/trips";
}

export default async function TravelStylesPage() {
  const travelStyles = await getTravelStyles();

  const defaultImages = {
    hero: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000&auto=format&fit=crop",
    card: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2200&auto=format&fit=crop",
  };

  const heroCtaHref = getTravelStyleHref(travelStyles[0]);
  const heroBullets = travelStyles.slice(0, 5).map((style: TravelStyle) => style.name);

  return (
    <main className="min-h-screen w-full bg-[#f5f5f5] pb-24">
      <div className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-12 xl:px-16">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:items-start xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div className="rounded-2xl bg-[#ededed] p-7 md:p-10">
            <h1 className="text-balance text-[42px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#171717] md:text-[58px]">
              Travel Styles
            </h1>
            <p className="mt-8 max-w-[38ch] text-[18px] leading-[1.5] text-[#3f3f3f]">
              Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories.
            </p>
            {heroBullets.length > 0 && (
              <ul className="mt-3 list-disc pl-6 text-[16px] leading-[1.5] text-[#2f2f2f]">
                {heroBullets.map((name: string) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
            <Link
              href={heroCtaHref}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#101010] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              View all Tours
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">↗</span>
            </Link>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-2xl md:h-[560px] lg:aspect-square lg:h-auto lg:min-h-[680px] xl:min-h-[760px]">
            <Image src={defaultImages.hero} alt="Travel styles" fill priority className="object-cover" />
          </div>
        </section>

        <div className="mt-16 space-y-14 md:mt-20 md:space-y-16">
        {travelStyles.length > 0 ? (
          travelStyles.map((ts: TravelStyle, index: number) => {
            const imageUrl =
              ts.image && ts.image !== "default-travel-style.jpg" && ts.image !== "default.jpg" && ts.image !== ""
                ? ts.image
                : defaultImages.card;

            const cleanDescription = stripHtml(ts.description) || stripHtml(ts.shortDescription);
            const cleanShortDescription = stripHtml(ts.shortDescription);
            const title = ts.name || ts.sections?.intro?.title || "Travel Style";
            const bullets = getStyleBullets(ts);
            const isReversed = index % 2 === 1;
            const styleHref = getTravelStyleHref(ts);
            const brandColor = ts.color && ts.color.trim() !== "" ? ts.color : "#a16338";

            return (
              <section
                key={ts._id}
                className={`grid grid-cols-1 gap-8 lg:items-start ${
                  isReversed ? "lg:grid-cols-[1fr_1.35fr]" : "lg:grid-cols-[1.35fr_1fr]"
                }`}
              >
                <div className={isReversed ? "lg:order-2" : "lg:order-1"}>
                  <span
                    className="inline-block rounded-full px-3 py-1 text-[11px] font-medium leading-none text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    Travel Styles
                  </span>
                  <h2 className="mt-3 text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#151515]">
                    <Link
                      href={styleHref}
                      className="transition-colors hover:text-black/75 hover:underline hover:underline-offset-4"
                    >
                      {title}
                    </Link>
                  </h2>

                  <Link
                    href={styleHref}
                    className="relative mt-6 block h-[380px] overflow-hidden rounded-2xl md:h-[520px] lg:h-[760px]"
                  >
                    <Image src={imageUrl} alt={ts.name} fill className="object-cover" />
                  </Link>
                </div>

                <div className={`rounded-2xl bg-[#ededed] px-7 py-7 md:px-9 md:py-9 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                  <h3 className="text-[56px] font-semibold leading-[1.03] tracking-[-0.02em] text-[#151515]">
                    {title}
                  </h3>

                  <p className="mt-6 text-[18px] leading-[1.5] text-[#333333]">
                    {cleanShortDescription || cleanDescription || "Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning traditions and crafts, and sleeping in authentic accommodations that tell stories."}
                  </p>

                  <ul className="mt-4 list-disc pl-6 text-[16px] leading-[1.5] text-[#222222]">
                    {bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>

                  <Link
                    href={styleHref}
                    className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: brandColor }}
                  >
                    View all Tours
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">↗</span>
                  </Link>
                </div>
              </section>
            );
          })
        ) : (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white py-16 text-center text-lg text-gray-500">
            No travel styles found.
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
