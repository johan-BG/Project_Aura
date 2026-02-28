/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com", "gateway.thegraph.com"],
  }
};

export default nextConfig;
