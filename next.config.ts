import type { NextConfig } from "next";

// When hosted on GitHub Pages under a project URL (https://<user>.github.io/<repo>/),
// set NEXT_PUBLIC_BASE_PATH=/<repo> at build time. Leave it unset for local dev.
// const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Generate a fully static site into the `out` folder on `next build`.
  output: "export",
  // Emit `/route/index.html` so static hosts like GitHub Pages resolve URLs cleanly.
  trailingSlash: true,
  // The default image optimizer needs a server, so serve images as-is.
  images: {
    unoptimized: true,
  },
  // basePath,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
