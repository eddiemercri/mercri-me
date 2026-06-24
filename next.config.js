const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
};
module.exports = nextConfig;
