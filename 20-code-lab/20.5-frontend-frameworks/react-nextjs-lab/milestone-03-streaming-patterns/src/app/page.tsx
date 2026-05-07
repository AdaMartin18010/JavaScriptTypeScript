import { Suspense } from 'react';
import { ProductList } from './ProductList';
import { ReviewList } from './ReviewList';
import { ProductSkeleton } from './ProductSkeleton';

export default function Page() {
  return (
    <main>
      <h1>M3: Streaming + Suspense</h1>
      <p>ProductList 和 ReviewList 独立流式加载，互不影响。</p>
      
      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />
      </Suspense>
      
      <Suspense fallback={<div style={{ padding: 16, color: '#666' }}>Loading reviews...</div>}>
        <ReviewList />
      </Suspense>
    </main>
  );
}
