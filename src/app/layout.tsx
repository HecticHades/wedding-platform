import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  // Body fonts
  Playfair_Display,
  Cormorant_Garamond,
  Libre_Baskerville,
  Merriweather,
  Lora,
  EB_Garamond,
  Inter,
  Montserrat,
  Raleway,
  Open_Sans,
  // Heading fonts
  Great_Vibes,
  Sacramento,
  Tangerine,
  Alex_Brush,
  Parisienne,
  Dancing_Script,
  Allura,
  Cinzel,
  Josefin_Sans,
  Amatic_SC,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Wedding body fonts
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

// Wedding heading fonts
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const tangerine = Tangerine({
  variable: "--font-tangerine",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  display: "swap",
});

const amaticSC = Amatic_SC({
  variable: "--font-amatic-sc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Combine all font variables
const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  playfairDisplay.variable,
  cormorantGaramond.variable,
  libreBaskerville.variable,
  merriweather.variable,
  lora.variable,
  ebGaramond.variable,
  inter.variable,
  montserrat.variable,
  raleway.variable,
  openSans.variable,
  greatVibes.variable,
  sacramento.variable,
  tangerine.variable,
  alexBrush.variable,
  parisienne.variable,
  dancingScript.variable,
  allura.variable,
  cinzel.variable,
  josefinSans.variable,
  amaticSC.variable,
].join(" ");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Wedding Website Platform",
  description: "Create beautiful wedding websites for your special day",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
