import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Разрешаем cross-origin запросы для разработки
  allowedDevOrigins: ["preview-chat-fb4ce2dc-de19-466b-be1c-b64a5ce999c1.space.z.ai"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ["**/*"], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
