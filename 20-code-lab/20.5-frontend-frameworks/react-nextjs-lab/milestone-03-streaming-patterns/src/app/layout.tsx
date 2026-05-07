export const metadata = { title: 'Streaming Lab M3' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body style={{ padding: 24, fontFamily: 'system-ui' }}>{children}</body>
    </html>
  );
}
