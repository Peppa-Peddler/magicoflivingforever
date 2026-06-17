import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image Viewer',
  description: 'An image viewer with focal point zooming and subtle animations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
