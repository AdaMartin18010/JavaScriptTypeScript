import { describe, it, expect, vi } from 'vitest';
import { Router, jsonMiddleware, corsMiddleware, loggerMiddleware, parseBody, createApp } from './basic-server';
import type { IncomingMessage, ServerResponse } from 'http';

function createMockReq(overrides: Partial<IncomingMessage> = {}): IncomingMessage {
  return {
    method: 'GET',
    url: '/',
    headers: {},
    on: vi.fn(),
    ...overrides,
  } as unknown as IncomingMessage;
}

function createMockRes(overrides: Partial<ServerResponse> = {}): ServerResponse {
  const res = {
    writeHead: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    statusCode: 200,
    ...overrides,
  } as unknown as ServerResponse;
  return res;
}

describe('Router', () => {
  it('should match GET route and call handler', async () => {
    const router = new Router();
    const handler = vi.fn();
    router.get('/users', handler);

    const req = createMockReq({ method: 'GET', url: '/users' });
    const res = createMockRes();
    await router.handle(req, res);

    expect(handler).toHaveBeenCalledWith(req, res, {});
  });

  it('should match route with params', async () => {
    const router = new Router();
    const handler = vi.fn();
    router.get('/users/:id', handler);

    const req = createMockReq({ method: 'GET', url: '/users/123' });
    const res = createMockRes();
    await router.handle(req, res);

    expect(handler).toHaveBeenCalledWith(req, res, { id: '123' });
  });

  it('should match POST route', async () => {
    const router = new Router();
    const handler = vi.fn();
    router.post('/users', handler);

    const req = createMockReq({ method: 'POST', url: '/users' });
    const res = createMockRes();
    await router.handle(req, res);

    expect(handler).toHaveBeenCalled();
  });

  it('should return 404 for unmatched routes', async () => {
    const router = new Router();
    const req = createMockReq({ method: 'GET', url: '/unknown' });
    const res = createMockRes();
    await router.handle(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
    expect((res as unknown as { end: ReturnType<typeof vi.fn> }).end).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Not Found' })
    );
  });

  it('should execute middleware before routes', async () => {
    const router = new Router();
    const middleware = vi.fn((req, res, next) => next());
    const handler = vi.fn();

    router.use(middleware).get('/users', handler);

    const req = createMockReq({ method: 'GET', url: '/users' });
    const res = createMockRes();
    await router.handle(req, res);

    expect(middleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('should support method chaining', () => {
    const router = new Router();
    const result = router
      .get('/a', () => {})
      .post('/b', () => {})
      .put('/c', () => {})
      .delete('/d', () => {});

    expect(result).toBe(router);
  });
});

describe('middlewares', () => {
  it('jsonMiddleware should set Content-Type header', () => {
    const res = createMockRes();
    const next = vi.fn();
    jsonMiddleware(createMockReq(), res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(next).toHaveBeenCalled();
  });

  it('corsMiddleware should set CORS headers', () => {
    const res = createMockRes();
    const next = vi.fn();
    corsMiddleware(createMockReq(), res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(next).toHaveBeenCalled();
  });

  it('loggerMiddleware should log requests', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = createMockRes();
    const next = vi.fn();
    const req = createMockReq({ method: 'GET', url: '/test' });

    loggerMiddleware(req, res, next);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('GET /test'));

    const finishHandler = (res.on as ReturnType<typeof vi.fn>).mock.calls.find(
      call => call[0] === 'finish'
    )?.[1];
    if (finishHandler) finishHandler();

    logSpy.mockRestore();
  });
});

describe('parseBody', () => {
  it('should parse JSON body', async () => {
    const req = createMockReq();
    const onMock = req.on as ReturnType<typeof vi.fn>;

    onMock.mockImplementation((event: string, cb: (arg?: unknown) => void) => {
      if (event === 'data') cb('{"name":"Alice"}');
      if (event === 'end') cb();
    });

    const body = await parseBody(req);
    expect(body).toEqual({ name: 'Alice' });
  });

  it('should return raw string for invalid JSON', async () => {
    const req = createMockReq();
    const onMock = req.on as ReturnType<typeof vi.fn>;

    onMock.mockImplementation((event: string, cb: (arg?: unknown) => void) => {
      if (event === 'data') cb('not-json');
      if (event === 'end') cb();
    });

    const body = await parseBody(req);
    expect(body).toBe('not-json');
  });

  it('should return empty object for empty body', async () => {
    const req = createMockReq();
    const onMock = req.on as ReturnType<typeof vi.fn>;

    onMock.mockImplementation((event: string, cb: (arg?: unknown) => void) => {
      if (event === 'data') cb('');
      if (event === 'end') cb();
    });

    const body = await parseBody(req);
    expect(body).toEqual({});
  });
});

describe('createApp', () => {
  it('should return a new Router instance', () => {
    const app = createApp();
    expect(app).toBeInstanceOf(Router);
  });
});
