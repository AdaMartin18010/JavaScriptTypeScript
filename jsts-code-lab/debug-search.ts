import { InvertedIndex, QueryProcessor, TFIDFScorer } from './64-search-engine/full-text-search';

const idx = new InvertedIndex();
idx.addDocument({ id: '1', title: 'TypeScript Guide', content: 'Learn TypeScript programming' });
idx.addDocument({ id: '2', title: 'JavaScript Patterns', content: 'Advanced JavaScript techniques' });
idx.addDocument({ id: '3', title: 'React and TypeScript', content: 'Build apps with React and TypeScript' });

const scorer = new TFIDFScorer(idx);
const score1 = (scorer as any).score('1', 'typescript', 'title');
const score2 = (scorer as any).score('1', 'typescript', 'content');
console.log('score1:', score1, 'score2:', score2);
console.log('totalDocs:', (idx as any).totalDocs);
console.log('docFreq:', idx.getDocFreq('typescript'));
console.log('idf:', idx.getIDF('typescript'));
console.log('postings:', idx.searchTerm('typescript'));
