/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows images from any HTTPS host
      }
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { message: /System is not supported/ },
      { message: /wmic/ },
      { message: /The system cannot find the file specified/ },
      { message: /ENOENT: no such file or directory, scandir/ },
      { message: /Watchpack Error/ },
    ];
    config.ignoreWarnings.push({ module: /node_modules\/\@supabase\/realtime-js/ });
    return config;
  },
};

module.exports = nextConfig; 