import Image from "next/image";

function Tile({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`relative h-full overflow-hidden rounded-[14px] ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

export default function TravelStyleGallerySection() {
  return (
    <section className="mt-16 md:mt-20">
      <span className="inline-flex rounded-full bg-[#e9ecf0] px-4 py-1 text-[12px] font-medium text-[#5e6678]">5 Reasons</span>
      <h2 className="mt-3 text-[40px] font-semibold leading-tight text-[#121b2f] md:text-[56px]">Why Local Living Adv.</h2>

      <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
        <div className="relative col-span-2 h-[270px] overflow-hidden rounded-[14px]">
          <Image
            src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1400&auto=format&fit=crop"
            alt="Desert jeeps"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-[190px] overflow-hidden rounded-[14px]">
          <Image
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1400&auto=format&fit=crop"
            alt="Mountain camp"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-[190px] overflow-hidden rounded-[14px]">
          <Image
            src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1400&auto=format&fit=crop"
            alt="Forest hike"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative col-span-2 h-[220px] overflow-hidden rounded-[14px]">
          <Image
            src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1400&auto=format&fit=crop"
            alt="Fort architecture"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-6 hidden h-[980px] grid-cols-12 grid-rows-13 gap-4 md:grid lg:h-[1140px] xl:h-[1240px]">
        <Tile
          src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1600&auto=format&fit=crop"
          alt="Desert convoy"
          className="col-span-5 row-span-6"
        />
        <Tile
          src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1600&auto=format&fit=crop"
          alt="Desert vehicle"
          className="col-start-6 col-span-4 row-span-3"
        />
        <Tile
          src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop"
          alt="Historic fort"
          className="col-start-10 col-span-3 row-span-3"
        />
        <Tile
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1400&auto=format&fit=crop"
          alt="Camp in snow valley"
          className="col-start-6 row-start-4 col-span-4 row-span-5"
        />
        <Tile
          src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200&auto=format&fit=crop"
          alt="Forest trail"
          className="col-start-10 row-start-4 col-span-3 row-span-3"
        />
        <Tile
          src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1000&auto=format&fit=crop"
          alt="Desert mini frame"
          className="col-start-10 row-start-7 col-span-3 row-span-2"
        />
        <Tile
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"
          alt="Tent valley"
          className="row-start-7 col-span-5 row-span-4"
        />
        <Tile
          src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=900&auto=format&fit=crop"
          alt="Fort wall"
          className="col-start-1 row-start-11 col-span-2 row-span-3"
        />
        <Tile
          src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=900&auto=format&fit=crop"
          alt="Rainforest hikers"
          className="col-start-3 row-start-11 col-span-3 row-span-3"
        />
        <Tile
          src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1800&auto=format&fit=crop"
          alt="Desert car panorama"
          className="col-start-6 row-start-9 col-span-7 row-span-5"
        />
      </div>
    </section>
  );
}