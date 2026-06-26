/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Windows / non-NTFS-event drives (e.g. F:) often miss native file events,
  // so Fast Refresh never fires. Poll instead so saves always hot-reload.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
