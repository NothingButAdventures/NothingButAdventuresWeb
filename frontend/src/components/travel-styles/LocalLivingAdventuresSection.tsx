import Image from "next/image";

export default function LocalLivingAdventuresSection() {
  return (
    <section className="mt-10 md:mt-14">
      <span className="inline-flex rounded-full bg-[#0f1e38] px-4 py-1 text-[12px] font-medium text-white">
        Travel Style
      </span>

      <h2 className="mt-4 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">
        Local Living Adventures
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-10">
        <div className="relative h-[320px] overflow-hidden rounded-[14px] md:h-[360px]">
          <Image
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
            alt="Local living portrait"
            fill
            className="object-cover"
          />
        </div>

        <div className="rounded-[14px] bg-[#f1f3f6] p-7 md:p-10">
          <h3 className="text-[34px] font-semibold leading-tight text-[#121b2f] md:text-[48px]">
            More than Just Sight Seeing
          </h3>
          <p className="mt-4 text-[14px] leading-relaxed text-[#3c4659] md:text-[15px]">
            Immersive travel is about experiencing a destination through the eyes of a local. It is eating at family restaurants, learning
            traditions, crafts, and sleeping in authentic accommodations that tell stories. It is eating at family restaurants, learning
            traditions crafts, and sleeping in authentic accommodations that tells stories.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-[#3c4659] md:text-[15px]">
            We believe travel should transform you, it is not about checking boxes - it is about creating meaningful connections, pushing our
            boundaries, and coming home with stories that matter.
          </p>
        </div>
      </div>
    </section>
  );
}