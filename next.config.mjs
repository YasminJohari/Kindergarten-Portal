/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors are enforced again in builds (`npm run typecheck` is clean).
    ignoreBuildErrors: false,
  },
  eslint: {
    // `next lint` currently crashes in this workspace: the installed
    // es-abstract package is missing 2024/Call.js, so eslint-plugin-react
    // cannot load. Repair node_modules (`npm ci`) before flipping this to
    // false, otherwise every production build fails. Lint is otherwise run
    // separately via `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

