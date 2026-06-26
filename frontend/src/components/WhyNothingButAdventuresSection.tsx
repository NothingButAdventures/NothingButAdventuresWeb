"use client";

import React from "react";

const cardsData = [
    {
        id: 1,
        icon: "/dd1.svg",
        title: "Small Groups, Big Adventures",
        description: "Small groups means deeper connections. Meet travellers from around the world and make every adventure feel like a shared passport stamp."
    },
    {
        id: 2,
        icon: "/dd2.svg",
        title: "Solo or Sociable, your Choice",
        description: "Choose to roam along with group or explore at your own pace, your choice"
    },
    {
        id: 3,
        icon: "/dd4.svg",
        title: "They are called Adventure Captains",
        description: "Our Adventure Captains are more than guides — they're local insiders, problem-solvers, storytellers, and hype crew rolled into one unforgettable experience."
    },
    {
        id: 4,
        icon: "/hjhj.png",
        title: "Immersive experiences are how we roll",
        description: "No sidelines, nothing but adventures here. Cook, craft, climb, and dive yourself fully in the heartbeat of local culture."
    },
    {
        id: 5,
        icon: "/dd5.svg",
        title: "Doing Good has never been so fun",
        description: "Travel powered by our community Tourism Model supporting people, places and planet while making memories that matter."
    },
    {
        id: 6,
        icon: "/dd6.svg",
        title: "Book with all the confidence in the world",
        description: (
            <>
                Worry-free travel, <span className="underline underline-offset-2 decoration-1">flexible booking options</span>, guaranteed departures, Lifetime Deposits and support whenever and wherever you need it.
            </>
        )
    }
];

export default function WhyNothingButAdventuresSection() {
    return (
        <section className="mx-auto mt-24 mb-16">
            {/* Header Area */}
            <div className="mb-10 px-4 md:px-6">
                <div className="inline-block px-4 py-1.5 bg-[#DEECFF] text-gray-500 rounded-full text-[13px] font-semibold tracking-wide mb-6">
                    Why Us
                </div>
                <h2 className="text-6xl md:text-[68px] font-medium leading-tight text-[#3F3F42] tracking-tight mb-4">
                    Why Nothing but Adventures
                </h2>
                <p className="text-[17px] md:text-[18px] text-gray-500 font-medium leading-[1.6]">
                    Few of the many reasons you'll love us
                </p>
            </div>

            {/* Cards Container */}
            <div className="bg-[#F1F3FF] p-4 md:p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {cardsData.map((card) => (
                        <div key={card.id} className="bg-white rounded-[20px] p-8 flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                            <div className="mb-10 flex justify-start">
                                <img
                                    src={card.icon}
                                    className="w-[140px] h-[140px] object-contain px-1"
                                    alt={card.title}
                                />
                            </div>
                            <h3 className="text-[24px] font-bold text-[#3F3F42] mb-5 leading-snug">
                                {card.title}
                            </h3>
                            <div className="text-gray-600 text-[18px] leading-relaxed">
                                {card.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
