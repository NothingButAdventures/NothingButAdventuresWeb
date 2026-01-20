const axios = require("axios");

const API_URL = "http://localhost:3001/api/v1";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "adminpass123";

const countries = [
  {
    name: "Nepal",
    code: "NP",
    continent: "Asia",
    description:
      "Nepal is a landlocked country in South Asia, home to Mount Everest and rich Buddhist heritage. Known for its stunning Himalayan landscapes, ancient temples, and warm hospitality.",
    shortDescription: "Home to Mount Everest and ancient Buddhist culture",
    currency: {
      code: "NPR",
      name: "Nepalese Rupee",
      symbol: "₨",
    },
    language: [
      {
        name: "Nepali",
        code: "ne",
        isPrimary: true,
      },
    ],
    timezone: [
      {
        name: "Nepal Time",
        offset: "+05:45",
      },
    ],
    climate: "temperate",
    bestTimeToVisit: [
      { season: "autumn", months: ["September", "October", "November"] },
      { season: "spring", months: ["March", "April", "May"] },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        caption: "Himalayan mountain range",
        isPrimary: true,
      },
    ],
    visa: {
      required: true,
      types: ["Tourist Visa", "Trekking Visa"],
      onArrival: true,
    },
  },
  {
    name: "Switzerland",
    code: "CH",
    continent: "Europe",
    description:
      "Switzerland is a mountainous Central European country, home to numerous lakes, villages and the high peaks of the Alps. Known for its chocolate, cheese, watches and banking.",
    shortDescription: "Alpine paradise with stunning mountains and luxury",
    currency: {
      code: "CHF",
      name: "Swiss Franc",
      symbol: "Fr",
    },
    language: [
      { name: "German", code: "de", isPrimary: true },
      { name: "French", code: "fr", isPrimary: false },
      { name: "Italian", code: "it", isPrimary: false },
    ],
    timezone: [
      {
        name: "Central European Time",
        offset: "+01:00",
      },
    ],
    climate: "temperate",
    bestTimeToVisit: [
      { season: "winter", months: ["December", "January", "February"] },
      { season: "summer", months: ["June", "July", "August"] },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697",
        caption: "Swiss Alps",
        isPrimary: true,
      },
    ],
    visa: {
      required: true,
      types: ["Schengen Visa"],
      onArrival: false,
    },
  },
  {
    name: "Indonesia",
    code: "ID",
    continent: "Asia",
    description:
      "Indonesia is a Southeast Asian nation made up of thousands of volcanic islands. Known for its beaches, volcanoes, Komodo dragons and jungles sheltering elephants, orangutans and tigers.",
    shortDescription: "Tropical paradise of thousands of islands",
    currency: {
      code: "IDR",
      name: "Indonesian Rupiah",
      symbol: "Rp",
    },
    language: [
      {
        name: "Indonesian",
        code: "id",
        isPrimary: true,
      },
    ],
    timezone: [
      {
        name: "Western Indonesian Time",
        offset: "+07:00",
      },
    ],
    climate: "tropical",
    bestTimeToVisit: [
      {
        season: "summer",
        months: ["May", "June", "July", "August", "September"],
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
        caption: "Bali Temple",
        isPrimary: true,
      },
    ],
    visa: {
      required: true,
      types: ["Tourist Visa"],
      onArrival: true,
    },
  },
  {
    name: "Kenya",
    code: "KE",
    continent: "Africa",
    description:
      "Kenya is a country in East Africa with coastline on the Indian Ocean. It encompasses savannah, lakelands, the dramatic Great Rift Valley and mountain highlands. It's also home to wildlife like lions, elephants and rhinos.",
    shortDescription: "East African safari paradise and wildlife haven",
    currency: {
      code: "KES",
      name: "Kenyan Shilling",
      symbol: "KSh",
    },
    language: [
      { name: "Swahili", code: "sw", isPrimary: true },
      { name: "English", code: "en", isPrimary: true },
    ],
    timezone: [
      {
        name: "East Africa Time",
        offset: "+03:00",
      },
    ],
    climate: "tropical",
    bestTimeToVisit: [
      { season: "summer", months: ["July", "August", "September", "October"] },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1516426122078-c23e76319801",
        caption: "African Safari",
        isPrimary: true,
      },
    ],
    visa: {
      required: true,
      types: ["Tourist Visa", "e-Visa"],
      onArrival: false,
    },
  },
  {
    name: "Iceland",
    code: "IS",
    continent: "Europe",
    description:
      "Iceland is a Nordic island nation known for its dramatic landscape with volcanoes, geysers, hot springs and lava fields. Massive glaciers are protected in Vatnajökull and Snæfellsjökull national parks.",
    shortDescription: "Land of fire, ice, and Northern Lights",
    currency: {
      code: "ISK",
      name: "Icelandic Króna",
      symbol: "kr",
    },
    language: [
      {
        name: "Icelandic",
        code: "is",
        isPrimary: true,
      },
    ],
    timezone: [
      {
        name: "Greenwich Mean Time",
        offset: "+00:00",
      },
    ],
    climate: "polar",
    bestTimeToVisit: [
      { season: "summer", months: ["June", "July", "August"] },
      {
        season: "winter",
        months: ["November", "December", "January", "February"],
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73",
        caption: "Northern Lights in Iceland",
        isPrimary: true,
      },
    ],
    visa: {
      required: false,
      types: ["Schengen Visa"],
      onArrival: false,
    },
  },
];

async function loginAsAdmin() {
  try {
    console.log("Logging in as admin...");
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log("✓ Admin logged in successfully");
    return response.data.token;
  } catch (error) {
    console.error(
      "✗ Failed to login:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
}

async function createCountry(token, countryData) {
  try {
    const response = await axios.post(`${API_URL}/countries`, countryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`✓ Created country: "${countryData.name}"`);
    return response.data.data.country;
  } catch (error) {
    if (
      error.response?.status === 409 ||
      error.response?.data?.message?.includes("duplicate")
    ) {
      console.log(`⊘ Country "${countryData.name}" already exists`);
      return null;
    }
    console.error(
      `✗ Failed to create country "${countryData.name}":`,
      error.response?.data?.message || error.message,
    );
    return null;
  }
}

async function seedCountries() {
  try {
    console.log("=== Country Seeding Script ===\n");

    const token = await loginAsAdmin();

    console.log("\n--- Creating Countries ---");

    let successCount = 0;
    for (const country of countries) {
      const created = await createCountry(token, country);
      if (created) {
        successCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total countries attempted: ${countries.length}`);
    console.log(`Successfully created: ${successCount}`);
  } catch (error) {
    console.error("\n✗ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedCountries();
