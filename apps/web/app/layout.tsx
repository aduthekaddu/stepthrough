import '@fontsource-variable/source-serif-4/opsz.css';
import '@fontsource-variable/source-serif-4/opsz-italic.css';
import '@fontsource-variable/ibm-plex-sans/index.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import './lesson.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { themeBootScript } from '@/lib/theme';

export const metadata: Metadata = {
  title: { default: 'Stepthrough', template: '%s · Stepthrough' },
  description: 'Software engineering from first principles, one step at a time.',
};

export const viewport: Viewport = { colorScheme: 'light dark' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed boot script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link ui">
          Skip to content
        </a>
        <header className="site-bar">
          <Link href="/" className="site-name">
            Stepthrough
          </Link>
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
