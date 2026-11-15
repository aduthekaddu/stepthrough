import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
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
