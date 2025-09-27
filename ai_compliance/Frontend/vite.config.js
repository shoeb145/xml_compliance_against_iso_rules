import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/frontend", // or '/xml-compliance-against-iso-rule2/' if you want to keep that path
});
