import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 👇 Ye line add karein aapke phone ka IP allow karne ke liye 👇
  allowedDevOrigins: ['10.15.248.27', 'localhost'],
};

export default nextConfig;