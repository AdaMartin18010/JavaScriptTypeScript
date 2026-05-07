async function getReviews() {
  await new Promise(r => setTimeout(r, 3000));
  return [
    { id: 1, user: 'Alice', text: 'Great product!' },
    { id: 2, user: 'Bob', text: 'Fast shipping.' },
  ];
}

export async function ReviewList() {
  const reviews = await getReviews();
  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #eaeaea', borderRadius: 8 }}>
      <h2>Reviews</h2>
      {reviews.map(r => (
        <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <strong>{r.user}</strong>: {r.text}
        </div>
      ))}
    </div>
  );
}
