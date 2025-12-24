/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude bcrypt and other native Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
      };
      
      // Mark bcrypt as external for client-side
      config.externals.push({
        bcrypt: 'bcrypt',
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;
