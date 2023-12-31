/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader', 'glslify-loader']
    });

    return config;
  },
};
