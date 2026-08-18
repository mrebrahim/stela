import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Stella Resale', template: '%s · Stella Resale' },
  description: 'Verified Stella-resort listings — buy, rent, or list your unit.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
