import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weights: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'LifeLink — Emergency Blood Network',
  description: 'Real-time emergency blood donor matching platform for hospitals and donors.',
  keywords: ['blood donation', 'emergency', 'hospital', 'donor', 'medical', 'emergency network'],
  authors: [{ name: 'LifeLink Team' }],
  creator: 'LifeLink',
  publisher: 'LifeLink',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lifelink-hospital.pages.dev',
    siteName: 'LifeLink',
    title: 'LifeLink — Emergency Blood Network',
    description: 'Real-time emergency blood donor matching platform for hospitals and donors.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LifeLink - Emergency Blood Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeLink — Emergency Blood Network',
    description: 'Real-time emergency blood donor matching platform.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://hqdiqjswknukqyghtgsa.supabase.co" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var root = document.documentElement;
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    root.setAttribute('data-theme', 'dark');
                  } else {
                    root.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(error) {
                  console.log('[SW] Registration failed:', error);
                });
              });
            }
          `,
        }}
      />
      <Providers>
        <main className="min-h-screen">{children}</main>
      </Providers>
    </body>
  </html>
);