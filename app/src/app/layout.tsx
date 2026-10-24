import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jbMono = JetBrains_Mono({
  variable: '--font-mono-jb',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Medora - Digital Health Platform',
  description:
    'A unified healthcare network for Sri Lanka with patient identity, portable medical records, doctor-hospital teams, and clear activity history.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased selection:bg-brand-200 selection:text-brand-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
