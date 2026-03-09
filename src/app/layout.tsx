import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/ThemeProvider';

export const metadata: Metadata = {
  title: 'Ruby Smart Notes',
  description: 'AI-Powered Smart Notes – Summarize, Quiz, and Chat with your lecture notes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="fluid-bg-container">
            <div className="blob-red"></div>
            <div className="blob-blue"></div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
