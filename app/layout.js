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