import { describe, it, expect, vi } from 'vitest';
import {
  validateRequest,
  asyncHandler,
  RouteBuilder,
  BaseController,
  requestLogger,
  authMiddleware,
  errorHandler,
  userCreateSchema,
} from './express-patterns';
import type { Request, Response, NextFunction } from './express-patterns';

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  } as Request;
}

function createMockRes(overrides: Partial<Response> = {}): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    statusCode: 200,
    ...overrides,
  } as unknown as Response;
  return res;
}

const mockNext = vi.fn() as NextFunction;

describe('validateRequest', () => {
  it('should pass valid requests', () => {
    const req = createMockReq({
      body: { email: 'test@example.com', name: 'Alice', age: 25 },
    });
    const res = createMockRes();
    const middleware = validateRequest(userCreateSchema);
    middleware(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject invalid body', () => {
    const req = createMockReq({
      body: { email: 'invalid', name: 'A', age: -1 },
    });
    const res = createMockRes();
    const middleware = validateRequest(userCreateSchema);
    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
  });

  it('should validate query and params', () => {
    const schema = {
      query: { search: (v: unknown) => typeof v === 'string' && v.length > 0 },
      params: { id: (v: unknown) => typeof v === 'string' && /^\d+$/.test(v) },
    };
    const req = createMockReq({ query: { search: 'test' }, params: { id: '123' } });
    const res = createMockRes();
    const middleware = validateRequest(schema);
    middleware(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('asyncHandler', () => {
  it('should catch async errors', async () => {
    const error = new Error('async error');
    const handler = asyncHandler(async (_req, _res, next) => {
      throw error;
    });

    const req = createMockReq();
    const res = createMockRes();
    handler(req, res, mockNext);
    await new Promise(r => setTimeout(r, 10));

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('RouteBuilder', () => {
  it('should build routes', () => {
    const builder = new RouteBuilder();
    const handler = vi.fn();
    const routes = builder
      .get('/users', handler)
      .post('/users', handler)
      .put('/users/:id', handler)
      .delete('/users/:id', handler)
      .build();

    expect(routes).toHaveLength(4);
    expect(routes[0].method).toBe('get');
    expect(routes[1].method).toBe('post');
  });

  it('should separate middlewares and handler', () => {
    const builder = new RouteBuilder();
    const middleware = vi.fn((_req, _res, next) => next());
    const handler = vi.fn();
    const routes = builder.get('/users', middleware, handler).build();

    expect(routes[0].middlewares).toHaveLength(1);
    expect(routes[0].handler).toBe(handler);
  });
});

describe('BaseController', () => {
  class TestController extends BaseController {
    testSuccess(res: Response) {
      this.success(res, { ok: true });
    }
    testError(res: Response) {
      this.error(res, 'failed', 400);
    }
    testCreated(res: Response) {
      this.created(res, { id: 1 });
    }
    testNoContent(res: Response) {
      this.noContent(res);
    }
  }

  const controller = new TestController();

  it('should send success response', () => {
    const res = createMockRes();
    controller.testSuccess(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { ok: true } });
  });

  it('should send error response', () => {
    const res = createMockRes();
    controller.testError(res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should send created response', () => {
    const res = createMockRes();
    controller.testCreated(res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should send no content response', () => {
    const res = createMockRes();
    controller.testNoContent(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

describe('requestLogger', () => {
  it('should log request completion', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const req = createMockReq({ method: 'GET', path: '/test' });
    const res = createMockRes();
    requestLogger(req, res, mockNext);

    const finishHandler = (res.on as ReturnType<typeof vi.fn>).mock.calls.find(
      call => call[0] === 'finish'
    )?.[1];
    if (finishHandler) finishHandler();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('GET /test'));
    logSpy.mockRestore();
  });
});

describe('authMiddleware', () => {
  it('should reject requests without token', () => {
    const req = createMockReq();
    const res = createMockRes();
    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should set user and call next with valid token', () => {
    const req = createMockReq({ headers: { authorization: 'Bearer valid-token' } });
    const res = createMockRes();
    authMiddleware(req, res, mockNext);

    expect(req.user).toEqual({ id: '123', email: 'user@example.com' });
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('errorHandler', () => {
  it('should handle validation errors', () => {
    const err = Object.assign(new Error('bad input'), { name: 'ValidationError' });
    const req = createMockReq();
    const res = createMockRes();
    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle unauthorized errors', () => {
    const err = Object.assign(new Error('unauthorized'), { name: 'UnauthorizedError' });
    const req = createMockReq();
    const res = createMockRes();
    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should handle generic errors', () => {
    const err = new Error('something broke');
    const req = createMockReq();
    const res = createMockRes();
    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
