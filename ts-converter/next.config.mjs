import withPWA from "next-pwa";

const pwa = withPWA({
  dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = pwa({
  output: "standalone",
});

export default nextConfig;
