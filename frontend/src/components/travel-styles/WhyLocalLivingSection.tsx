import Image from "next/image";

const reasons = [
  {
    title: "Local Living Adventures",
    description:
      "Immersive travel is about experiencing a destination through the eys of a Local. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories. eys of a Local. It's eating at Family restaurants,",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Local Living Adventures",
    description:
      "Immersive travel is about experiencing a destination through the eys of a Local. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories. eys of a Local. It's eating at Family restaurants,",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Local Living Adventures",
    description:
      "Immersive travel is about experiencing a destination through the eys of a Local. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories. eys of a Local. It's eating at Family restaurants,",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Local Living Adventures",
    description:
      "Immersive travel is about experiencing a destination through the eys of a Local. It's eating at Family restaurants, Learning traditions crafts, and sleeping in authentic accommodations that tells stories. eys of a Local. It's eating at Family restaurants,",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop",
  },
];

export default function WhyLocalLivingSection() {
  return (
    <section className="mt-14 md:mt-16">
      <span className="inline-flex rounded-full bg-[#e9ecf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">5 Reasons</span>

      <h2 className="mt-3 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[58px]">
        Why Local Living Adv.
      </h2>

      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-10">
        <div>
          <h3 className="text-[26px] font-medium leading-[1.1] text-[#111b31] md:text-[34px] lg:text-[46px]">
            4 Reasons To Choose
            <br />
            Local Living
            <br />
            Adventures
          </h3>
        </div>

        <div className="space-y-3">
          {reasons.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="flex items-start gap-4 rounded-[12px] bg-[#f2f4f7] px-4 py-3.5 md:gap-5 md:px-5"
            >
              <div className="relative h-[98px] w-[98px] shrink-0 overflow-hidden rounded-[10px]">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>

              <div className="min-w-0 pt-0.5">
                <h4 className="text-[22px] font-semibold leading-tight text-[#18243b] md:text-[23px]">{item.title}</h4>
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.35] text-[#4f586b] md:text-[13px]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}