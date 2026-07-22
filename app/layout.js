import localFont from 'next/font/local';
import './globals.css';

export const metadata = {
  title: 'Agency Directory',
  description: 'Internal Partner Database for Agencies',
};

// localFont 선언
const polymath = localFont({
  src: [
    {
      path: '../assets/PolymathTextDemo-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/PolymathDispDemo-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/PolymathDispDemo-Super.woff',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-polymath',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${polymath.variable} antialiased bg-neutral-950 text-neutral-100`}>
        {children}
      </body>
    </html>
  );
}