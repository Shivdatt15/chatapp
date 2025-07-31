/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:1604003406,
    NEXT_PUBLIC_ZEGO_SERVER_ID:"ce249b02025facff0b1c76177cdc8b62"
  },
  images:{
   domains:["localhost"],
  },
};

module.exports = nextConfig;
