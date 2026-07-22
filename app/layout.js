import './globals.css';

export const metadata = {
  title: 'A-LIST Agency Directory',
  description: 'Internal Partner Database for Agencies',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}

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
  variable: '--font-polymath', // CSS 변수로 사용할 이름
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      {/* 2. body 태그에 폰트 변수 클래스 적용 */}
      <body className={polymath.variable}>{children}</body>
    </html>
  );
}