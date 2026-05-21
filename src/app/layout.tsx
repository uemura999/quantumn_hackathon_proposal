import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { GlobalHUD } from '@/components/hud/GlobalHUD';
import './globals.css';

const notoJp = Noto_Sans_JP({
  variable: '--font-noto-jp',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Opening Urban Challenges with Q',
  description:
    'NTT西日本 × 電通 — 量子技術で都市の配送ルートを最適化する、2時間体験型ハッカソン。',
};

export const viewport: Viewport = {
  themeColor: '#F5F1EA',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${notoJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalHUD />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
