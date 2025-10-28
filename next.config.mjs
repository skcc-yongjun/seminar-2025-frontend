/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 서버 타임아웃 설정 (300초)
  serverRuntimeConfig: {
    timeout: 300000, // 300초
  },
}

export default nextConfig
