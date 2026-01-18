export interface PreviewContent {
  couple: {
    partner1: string;
    partner2: string;
    tagline: string;
  };
  date: {
    display: string;
    countdown: number;
  };
  story: {
    title: string;
    paragraphs: string[];
  };
  events: {
    name: string;
    date: string;
    time: string;
    venue: string;
    address: string;
  }[];
  gallery: {
    url: string;
    alt: string;
  }[];
  travel: {
    hotels: {
      name: string;
      distance: string;
      rate: string;
    }[];
    airports: string[];
  };
  registry: {
    stores: string[];
  };
}

/**
 * Get preview content with custom partner names
 */
export function getPreviewContent(partner1Name?: string, partner2Name?: string): PreviewContent {
  return {
    ...defaultPreviewContent,
    couple: {
      ...defaultPreviewContent.couple,
      partner1: partner1Name || defaultPreviewContent.couple.partner1,
      partner2: partner2Name || defaultPreviewContent.couple.partner2,
    },
  };
}

export const defaultPreviewContent: PreviewContent = {
  couple: {
    partner1: "Emma",
    partner2: "James",
    tagline: "We're getting married!",
  },
  date: {
    display: "June 15, 2025",
    countdown: 150,
  },
  story: {
    title: "Our Story",
    paragraphs: [
      "We met on a rainy afternoon in the city, both seeking shelter in the same cozy bookshop. James was reaching for the same book I was - our hands touched, and we've been inseparable ever since.",
      "After three years of adventures, laughter, and growing together, James proposed during a sunset picnic at our favorite spot overlooking the bay. I said yes before he could even finish the question!",
    ],
  },
  events: [
    {
      name: "Wedding Ceremony",
      date: "June 15, 2025",
      time: "4:00 PM",
      venue: "Rosewood Gardens",
      address: "123 Garden Lane, Maplewood, CA 94523",
    },
    {
      name: "Reception",
      date: "June 15, 2025",
      time: "6:00 PM",
      venue: "The Grand Ballroom",
      address: "456 Celebration Ave, Maplewood, CA 94523",
    },
  ],
  gallery: [
    { url: "/preview/couple-1.jpg", alt: "Engagement photo 1" },
    { url: "/preview/couple-2.jpg", alt: "Engagement photo 2" },
    { url: "/preview/couple-3.jpg", alt: "Engagement photo 3" },
    { url: "/preview/couple-4.jpg", alt: "Engagement photo 4" },
  ],
  travel: {
    hotels: [
      { name: "The Maplewood Inn", distance: "0.5 miles", rate: "$159/night" },
      { name: "Comfort Suites", distance: "1.2 miles", rate: "$119/night" },
    ],
    airports: ["San Francisco International (SFO) - 45 min", "Oakland (OAK) - 30 min"],
  },
  registry: {
    stores: ["Amazon", "Crate & Barrel", "Williams Sonoma"],
  },
};
