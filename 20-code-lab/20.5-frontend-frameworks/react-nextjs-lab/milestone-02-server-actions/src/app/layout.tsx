export const metadata = { title: 'Server Actions Lab M2' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body style={{ padding: 24, fontFamily: 'system-ui' }}>{children}</body>
    </html>
  );
}
