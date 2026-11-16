import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  // GitHub Pages serves a project site under /<repo>; local builds stay at the root.
  basePath: process.env.PAGES_BASE_PATH ?? '',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  transpilePackages: ['@stepthrough/sandbox', '@stepthrough/content-check'],
};

const withMDX = createMDX({
  options: { remarkPlugins: ['remark-frontmatter'] },
});

export default withMDX(config);
