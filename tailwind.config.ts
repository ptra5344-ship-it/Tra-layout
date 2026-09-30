import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { gold: "#f5b301", night: "#0d1117", panel: "#161b22" } } },
  plugins: [],
} satisfies Config;
