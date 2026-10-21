import type { Dictionary } from "@/content/types";
import { AboutContact } from "./sections/AboutContact";
import { Availability } from "./sections/Availability";
import { Experience } from "./sections/Experience";
import { Marquee } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { Nav } from "./sections/Nav";
import { Principles } from "./sections/Principles";
import { Projects } from "./sections/Projects";
import { Stack } from "./sections/Stack";

export function HomePage({ dict }: { dict: Dictionary }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-10">
      <Nav dict={dict} />
      <main>
        <Hero dict={dict} />
        <Availability dict={dict} />
        <Projects dict={dict} />
        <Experience dict={dict} />
        <Principles dict={dict} />
        <Stack dict={dict} />
        <AboutContact dict={dict} />
      </main>
      <Marquee text={dict.marquee} />
    </div>
  );
}
