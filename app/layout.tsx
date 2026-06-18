import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const garamono = localFont({
  src: [
    {
      path: '../public/CMUSerif-Roman.woff2',
      weight: 'normal',
      style: 'normal',
    },
    {
      path: '../public/CMUSerif-Italic.woff2',
      weight: 'normal',
      style: 'italic',
    },
  ],
});

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
    <html lang="en" className={garamono.className}>
      <body className='text-2xl'>{children}</body>
    </html>
  );
}
