import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

// Metadata export at the end to satisfy fast refresh
export const metadata: Metadata = {
  title: 'TutorPilot - WaveHacks 2',
  description: 'Self-Improving AI Tutoring Platform for WaveHacks 2 Hackathon',
};
