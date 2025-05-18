/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:1674605894,
    NEXT_PUBLIC_ZEGO_SERVER_ID:"6f7f7e3a0a5d36d8ce6b3f99239d9b5e"
  },
  images:{
   domains:["localhost"],
  },
};

module.exports = nextConfig;
