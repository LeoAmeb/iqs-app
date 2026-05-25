import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "@react-pdf/renderer", "bcryptjs"],
};

export default nextConfig;
