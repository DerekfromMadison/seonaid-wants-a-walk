import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/providers/react-query-provider';

export const metadata: Metadata = {
  title: 'London Walk Companion',
  description:
    'Plan time-boxed walks across London with blended walking and Tube routes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
