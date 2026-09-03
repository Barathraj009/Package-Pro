import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // "Route ink" palette — a paper-map, travel-desk feel rather than
        // generic SaaS blue. Named for what they're used for, not hue.
        paper: "#F7F3EC", // base background — aged map paper
        ink: "#1F2A24", // primary text — deep pine ink
        route: "#2B6F5C", // primary accent — the plotted route line (teal-pine)
        "route-dark": "#1E4F41",
        stamp: "#C4622D", // secondary accent — postmark/visa-stamp terracotta, used sparingly
        brass: "#B08D57", // tertiary accent — luggage-tag brass, for price/currency emphasis
        mist: "#E4DFD3", // card borders, dividers
        card: "#FFFDF8",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(31,42,36,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,42,36,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
