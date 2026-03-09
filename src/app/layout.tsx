import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ruby Smart Notes',
  description: 'AI-Powered Smart Notes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fluid-bg-container">
          <div className="blob-red"></div>
          <div className="blob-blue"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
