import { describe, it, expect } from 'vitest';
import { FacetCalculator, FilterEngine, FacetedSearch } from './faceted-search';

describe('FacetCalculator', () => {
  const docs = [
    { id: '1', category: 'a', price: 10 },
    { id: '2', category: 'a', price: 60 },
    { id: '3', category: 'b', price: 150 }
  ];

  it('calculates terms facet', () => {
    const calc = new FacetCalculator();
    const result = calc.calculateTermsFacet(docs, 'category');
    expect(result.values.find(v => v.value === 'a')?.count).toBe(2);
    expect(result.values.find(v => v.value === 'b')?.count).toBe(1);
  });

  it('calculates range facet', () => {
    const calc = new FacetCalculator();
    const result = calc.calculateRangeFacet(docs, 'price', [
      { key: 'low', from: 0, to: 50 },
      { key: 'mid', from: 50, to: 100 },
      { key: 'high', from: 100 }
    ]);
    expect(result.values.find(v => v.value === 'low')?.count).toBe(1);
    expect(result.values.find(v => v.value === 'high')?.count).toBe(1);
  });
});

describe('FilterEngine', () => {
  const docs = [
    { id: '1', category: 'a', price: 10 },
    { id: '2', category: 'a', price: 60 },
    { id: '3', category: 'b', price: 150 }
  ];

  it('filters by eq', () => {
    const engine = new FilterEngine();
    expect(engine.applyFilters(docs, [{ field: 'category', operator: 'eq', value: 'a' }]).length).toBe(2);
  });

  it('filters by range', () => {
    const engine = new FilterEngine();
    expect(engine.applyFilters(docs, [{ field: 'price', operator: 'range', value: { gte: 50, lte: 100 } }]).length).toBe(1);
  });
});

describe('FacetedSearch', () => {
  it('searches and returns facets', () => {
    const search = new FacetedSearch();
    search.addDocument({ id: '1', name: 'Phone', category: 'elec', price: 99 });
    search.addDocument({ id: '2', name: 'Chair', category: 'home', price: 50 });
    search.setFacetConfig([{ field: 'category', type: 'terms' }]);
    const result = search.search({});
    expect(result.total).toBe(2);
    expect(result.facets[0].values.length).toBeGreaterThan(0);
  });

  it('generates breadcrumbs', () => {
    const search = new FacetedSearch();
    const crumbs = search.getBreadcrumbs([{ field: 'category', operator: 'eq', value: 'elec' }]);
    expect(crumbs[0].field).toBe('category');
  });
});
