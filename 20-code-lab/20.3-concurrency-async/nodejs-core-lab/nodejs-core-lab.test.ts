import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { Readable } from 'node:stream';
import {
  resolveSafePath,
  writeFileAtomic,
  readFileChunks,
  walkDir,
  mirrorDir,
  HttpRouterServer,
  compressResponse,
  createProxyHandler,
  getHealthStatus,
  readBody,
  readJSON,
  sha256,
  sha512,
  hmacSha256,
  aesGcmEncrypt,
  aesGcmDecrypt,
  deriveKeyScrypt,
  deriveKeyPbkdf2,
  randomHex,
  randomToken,
  hashPassword,
  verifyPassword,
  LineTransform,
  CSVParseTransform,
  RateLimitTransform,
  collectStream,
  iterableToReadable,
  nodeToWebReadable,
  webToNodeReadable
} from './index.js';

describe('91-nodejs-core-lab', () => {
  describe('fs-patterns', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nodejs-core-test-'));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('resolveSafePath should resolve valid paths', () => {
      const resolved = resolveSafePath('/data', 'files/image.png');
      expect(resolved).toBe(path.resolve('/data', 'files/image.png'));
    });

    it('resolveSafePath should reject path traversal', () => {
      expect(() => resolveSafePath('/data', '../../../etc/passwd')).toThrow('非法路径');
    });

    it('writeFileAtomic should write file safely', async () => {
      const filePath = path.join(tempDir, 'atomic.txt');
      await writeFileAtomic(filePath, 'atomic content');
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('atomic content');
    });

    it('readFileChunks should read file in chunks', async () => {
      const filePath = path.join(tempDir, 'chunked.bin');
      const data = Buffer.alloc(1024, 0xAB);
      await fs.writeFile(filePath, data);

      const chunks: Buffer[] = [];
      for await (const chunk of readFileChunks(filePath, { chunkSize: 256 })) {
        chunks.push(chunk);
      }
      expect(chunks.length).toBe(4);
      expect(Buffer.concat(chunks)).toEqual(data);
    });

    it('walkDir should traverse directory tree', async () => {
      await fs.mkdir(path.join(tempDir, 'sub'));
      await fs.writeFile(path.join(tempDir, 'a.txt'), 'a');
      await fs.writeFile(path.join(tempDir, 'sub', 'b.txt'), 'b');

      const entries: string[] = [];
      for await (const e of walkDir(tempDir, { maxDepth: 2 })) {
        if (e.stats.isFile()) entries.push(e.name);
      }
      expect(entries.sort()).toEqual(['a.txt', 'b.txt']);
    });

    it('mirrorDir should sync source to destination', async () => {
      const src = path.join(tempDir, 'src');
      const dest = path.join(tempDir, 'dest');
      await fs.mkdir(path.join(src, 'sub'), { recursive: true });
      await fs.writeFile(path.join(src, 'file.txt'), 'hello');
      await fs.writeFile(path.join(src, 'sub', 'nested.txt'), 'world');

      await mirrorDir(src, dest);

      const destContent = await fs.readFile(path.join(dest, 'file.txt'), 'utf-8');
      expect(destContent).toBe('hello');
      const nestedContent = await fs.readFile(path.join(dest, 'sub', 'nested.txt'), 'utf-8');
      expect(nestedContent).toBe('world');
    });
  });

  describe('http-server-patterns', () => {
    let server: HttpRouterServer;

    beforeEach(async () => {
      server = new HttpRouterServer();
      server
        .route('GET', '/health', (_req, res) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(getHealthStatus()));
        })
        .route('GET', '/users/:id', (_req, res, params) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ userId: params.id }));
        })
        .route('POST', '/echo', async (req, res) => {
          const body = await readJSON(req);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(body));
        });
      await server.listen(0, '127.0.0.1');
    });

    afterEach(async () => {
      await server.close();
    });

    function request(path: string, method = 'GET', body?: unknown): Promise<{ status: number; data: unknown }> {
      const addr = server.address!;
      const port = Number(addr.split(':').pop());
      return new Promise((resolve, reject) => {
        const req = http.request(
          { hostname: '127.0.0.1', port, path, method, headers: body ? { 'Content-Type': 'application/json' } : undefined },
          (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode ?? 0, data: JSON.parse(data) });
              } catch {
                resolve({ status: res.statusCode ?? 0, data });
              }
            });
          }
        );
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    }

    it('should return health status', async () => {
      const { status, data } = await request('/health');
      expect(status).toBe(200);
      expect((data as any).status).toBe('healthy');
    });

    it('should extract route params', async () => {
      const { status, data } = await request('/users/42');
      expect(status).toBe(200);
      expect((data as any).userId).toBe('42');
    });

    it('should echo JSON body', async () => {
      const { status, data } = await request('/echo', 'POST', { hello: 'world' });
      expect(status).toBe(200);
      expect(data).toEqual({ hello: 'world' });
    });

    it('should return 404 for unknown routes', async () => {
      const { status } = await request('/not-found');
      expect(status).toBe(404);
    });

    it('compressResponse should compress large bodies', async () => {
      const req = { headers: { 'accept-encoding': 'gzip' } } as http.IncomingMessage;
      const res = { setHeader: vi.fn() } as unknown as http.ServerResponse;
      const body = 'x'.repeat(2000);
      const compressed = await compressResponse(req, res, body);
      expect(Buffer.isBuffer(compressed)).toBe(true);
      expect((compressed as Buffer).length).toBeLessThan(body.length);
    });

    it('readBody should reject oversized bodies', async () => {
      const req = new Readable({ read() {} }) as http.IncomingMessage;
      const promise = readBody(req, 10);
      req.emit('data', Buffer.alloc(20, 'a'));
      await expect(promise).rejects.toThrow('超过最大限制');
    });
  });

  describe('crypto-patterns', () => {
    it('sha256 should produce consistent hash', () => {
      const hash1 = sha256('test');
      const hash2 = sha256('test');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('sha512 should produce 128 hex chars', () => {
      expect(sha512('test')).toHaveLength(128);
    });

    it('hmacSha256 should be deterministic with same key', () => {
      const mac1 = hmacSha256('key', 'data');
      const mac2 = hmacSha256('key', 'data');
      expect(mac1).toBe(mac2);
    });

    it('aesGcmEncrypt and aesGcmDecrypt should round-trip', () => {
      const key = Buffer.alloc(32, 0xAA);
      const plaintext = 'Hello, 世界!';
      const encrypted = aesGcmEncrypt(plaintext, key);
      const decrypted = aesGcmDecrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it('aesGcmEncrypt should reject wrong key size', () => {
      expect(() => aesGcmEncrypt('test', Buffer.alloc(16))).toThrow('密钥必须为 32 字节');
    });

    it('deriveKeyScrypt should derive reproducible key', async () => {
      const { key, salt } = await deriveKeyScrypt('password');
      const { key: key2 } = await deriveKeyScrypt('password', salt);
      expect(key.toString('hex')).toBe(key2.toString('hex'));
    });

    it('deriveKeyPbkdf2 should derive key', async () => {
      const { key, salt } = await deriveKeyPbkdf2('password');
      expect(key.length).toBe(32);
      const { key: key2 } = await deriveKeyPbkdf2('password', salt);
      expect(key.toString('hex')).toBe(key2.toString('hex'));
    });

    it('randomHex should generate hex string', () => {
      const hex = randomHex(16);
      expect(hex).toHaveLength(32);
      expect(/^[0-9a-f]+$/i.test(hex)).toBe(true);
    });

    it('randomToken should generate base64url string', () => {
      const token = randomToken(16);
      expect(token.length).toBeGreaterThan(0);
      expect(!token.includes('+')).toBe(true);
      expect(!token.includes('/')).toBe(true);
    });

    it('hashPassword and verifyPassword should work', async () => {
      const stored = await hashPassword('my-password');
      expect(await verifyPassword('my-password', stored)).toBe(true);
      expect(await verifyPassword('wrong-password', stored)).toBe(false);
    });
  });

  describe('stream-pipeline', () => {
    it('LineTransform should split lines', async () => {
      const transform = new LineTransform();
      const lines: string[] = [];
      transform.on('data', (line: string) => lines.push(line));
      transform.write(Buffer.from('a\nb\nc'));
      transform.end();
      await new Promise((resolve) => transform.on('end', resolve));
      expect(lines).toEqual(['a', 'b', 'c']);
    });

    it('CSVParseTransform should parse CSV records', async () => {
      const transform = new CSVParseTransform();
      const records: any[] = [];
      transform.on('data', (r) => records.push(r));
      transform.write('name,age\n');
      transform.write('Alice,30\n');
      transform.write('Bob,25');
      transform.end();
      await new Promise((resolve) => transform.on('end', resolve));
      expect(records).toEqual([{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]);
    });

    it('RateLimitTransform should pass data through', async () => {
      const transform = new RateLimitTransform<string>({ ratePerSecond: 1000 });
      const results: string[] = [];
      transform.on('data', (r: string) => results.push(r));
      transform.write('x');
      transform.write('y');
      transform.end();
      await new Promise((resolve) => transform.on('end', resolve));
      expect(results).toEqual(['x', 'y']);
    });

    it('collectStream should gather all chunks', async () => {
      const source = (await import('node:stream')).Readable.from([1, 2, 3]);
      const collected = await collectStream<number>(source);
      expect(collected).toEqual([1, 2, 3]);
    });

    it('iterableToReadable should create readable from async iterable', async () => {
      async function* gen() {
        yield 'a';
        yield 'b';
      }
      const readable = iterableToReadable(gen());
      const collected = await collectStream<string>(readable);
      expect(collected).toEqual(['a', 'b']);
    });

    it('nodeToWebReadable should produce Web ReadableStream', async () => {
      const { Readable } = await import('node:stream');
      const nodeStream = Readable.from(['hello']);
      const webStream = nodeToWebReadable(nodeStream);
      expect(webStream).toBeInstanceOf(ReadableStream);
    });

    it('webToNodeReadable should produce Node.js Readable', async () => {
      const webStream = new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from('test'));
          controller.close();
        }
      });
      const nodeStream = webToNodeReadable(webStream);
      expect(nodeStream).toBeDefined();
    });
  });
});
