export async function ServerData() {
  const data = await fetch('https://api.github.com/users/vercel', {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return (
    <div style={{ marginTop: 24, padding: 16, border: '1px solid #eaeaea', borderRadius: 8 }}>
      <p>Server Component (fetched at build/request time)</p>
      <pre style={{ background: '#f4f4f4', padding: 12 }}>{JSON.stringify({ login: data.login, id: data.id }, null, 2)}</pre>
    </div>
  );
}
