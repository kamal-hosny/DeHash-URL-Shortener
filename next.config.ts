import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  reactCompiler: {
    compilationMode: 'annotation',
  },



  modularizeImports: {
    lodash: {
      transform: "lodash/{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
};

export default nextConfig;
