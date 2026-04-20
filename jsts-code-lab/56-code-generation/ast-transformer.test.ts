import { describe, it, expect } from 'vitest';
import {
  ASTTransformer,
  SourceMapTracker,
  type Program,
  type FunctionDeclaration
} from './ast-transformer.js';

describe('ASTTransformer', () => {
  it('ASTTransformer is defined', () => {
    expect(typeof ASTTransformer).not.toBe('undefined');
  });

  it('can be instantiated', () => {
    const transformer = new ASTTransformer();
    expect(transformer).toBeDefined();
  });

  it('traverses all nodes in sample AST', () => {
    const transformer = new ASTTransformer();
    const sampleAst: Program = {
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'add' },
          params: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' }
          ],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'BinaryExpression',
                  operator: '+',
                  left: { type: 'Identifier', name: 'a' },
                  right: { type: 'Identifier', name: 'b' }
                }
              }
            ]
          },
          async: false
        }
      ]
    };

    let count = 0;
    transformer.traverse(sampleAst, {
      enter: () => { count++; }
    });

    expect(count).toBeGreaterThan(0);
  });

  it('addLogging inserts console statement into function body', () => {
    const transformer = new ASTTransformer();
    const sampleAst: Program = {
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'test' },
          params: [],
          body: {
            type: 'BlockStatement',
            body: []
          },
          async: false
        }
      ]
    };

    const result = transformer.addLogging(sampleAst, 'log');
    const func = result.body[0] as FunctionDeclaration;
    expect(func.body.body.length).toBe(1);
    expect(func.body.body[0].type).toBe('ExpressionStatement');
  });

  it('renameIdentifiers changes identifier names', () => {
    const transformer = new ASTTransformer();
    const sampleAst: Program = {
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'oldName' },
          params: [
            { type: 'Identifier', name: 'x' }
          ],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: { type: 'Identifier', name: 'x' }
              }
            ]
          },
          async: false
        }
      ]
    };

    const result = transformer.renameIdentifiers(sampleAst, { oldName: 'newName', x: 'y' });
    const func = result.body[0] as FunctionDeclaration;
    expect(func.id?.name).toBe('newName');
    expect(func.params[0].name).toBe('y');
  });

  it('wrapWithTryCatch wraps function body in try statement', () => {
    const transformer = new ASTTransformer();
    const sampleAst: Program = {
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'risky' },
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }
            ]
          },
          async: false
        }
      ]
    };

    const result = transformer.wrapWithTryCatch(sampleAst);
    const func = result.body[0] as FunctionDeclaration;
    expect(func.body.body.length).toBe(1);
    expect(func.body.body[0].type).toBe('TryStatement');
  });

  it('simulateTsCompilerApi returns sourceFile and forEachChild', () => {
    const transformer = new ASTTransformer();
    const sourceCode = 'const x = 1;\nfunction add() {}';
    const api = transformer.simulateTsCompilerApi(sourceCode);

    expect(api.sourceFile.fileName).toBe('input.ts');
    expect(api.sourceFile.statements.length).toBe(2);

    const collected: string[] = [];
    api.forEachChild((node) => collected.push(node));
    expect(collected.length).toBe(2);
  });

  it('demo is defined and callable', async () => {
    const { demo } = await import('./ast-transformer.js');
    expect(typeof demo).toBe('function');
    await expect(demo()).resolves.toBeUndefined();
  });
});

describe('SourceMapTracker', () => {
  it('tracks and returns mappings', () => {
    const tracker = new SourceMapTracker();
    tracker.addMapping({
      originalLine: 1,
      originalColumn: 0,
      generatedLine: 2,
      generatedColumn: 4,
      source: 'input.ts'
    });

    expect(tracker.getMappings().length).toBe(1);
  });

  it('shifts lines correctly', () => {
    const tracker = new SourceMapTracker();
    tracker.addMapping({
      originalLine: 1,
      originalColumn: 0,
      generatedLine: 5,
      generatedColumn: 0,
      source: 'input.ts'
    });

    tracker.shiftLines(3, 2);
    const mappings = tracker.getMappings();
    expect(mappings[0].generatedLine).toBe(7);
  });
});
