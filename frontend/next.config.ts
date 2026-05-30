import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strip console.* calls from production bundles, except warn/error so real
  // problems still surface in the browser console. Keeps prod bundles smaller
  // and prevents accidental data leakage via dev console.log statements.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['warn', 'error'] }
        : false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Google Sign-In popup must postMessage back to the opener window.
          // Default 'same-origin' COOP blocks that; this allows popups only.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
};

export default nextConfig;