async function getProducts() {
  await new Promise(r => setTimeout(r, 1500));
  return [
    { id: 1, name: 'MacBook Pro', price: 1999 },
    { id: 2, name: 'iPhone 15', price: 999 },
  ];
}

export async function ProductList() {
  const products = await getProducts();
  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #eaeaea', borderRadius: 8 }}>
      <h2>Products</h2>
      {products.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span>{p.name}</span>
          <span>${p.price}</span>
        </div>
      ))}
    </div>
  );
}
