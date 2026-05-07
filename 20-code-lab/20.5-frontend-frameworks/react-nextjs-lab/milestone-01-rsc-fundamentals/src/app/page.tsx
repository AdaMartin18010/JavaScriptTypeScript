import { ClientCounter } from './ClientCounter';
import { ServerData } from './ServerData';

export const runtime = 'edge';

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>M1: RSC Fundamentals</h1>
      <p style={{ color: '#666' }}>
        本页面是 Server Component（默认）。下方 ClientCounter 是客户端组件。
      </p>
      <ServerData />
      <ClientCounter />
    </main>
  );
}
