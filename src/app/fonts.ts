import { JetBrains_Mono, Silkscreen } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: "400",
});

export const fontVariables = `${jetbrainsMono.variable} ${silkscreen.variable}`;
