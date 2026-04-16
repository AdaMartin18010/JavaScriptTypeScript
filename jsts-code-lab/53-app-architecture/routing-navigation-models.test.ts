import { describe, it, expect } from 'vitest'
import { matchRoute, matchNestedRoute, RouteGuard } from './routing-navigation-models'

describe('matchRoute', () => {
  it('matches static route', () => {
    const routes = [{ path: '/home', component: 'Home' }]
    expect(matchRoute('/home', routes)?.component).toBe('Home')
  })

  it('matches param route', () => {
    const routes = [{ path: '/user/:id', component: 'User' }]
    expect(matchRoute('/user/123', routes)?.component).toBe('User')
  })
})

describe('matchNestedRoute', () => {
  it('matches nested routes and extracts params', () => {
    const routes = [{ path: '/shop', component: 'Shop', children: [{ path: ':productId', component: 'Product' }] }]
    const result = matchNestedRoute('/shop/42', routes)
    expect(result.matched.length).toBe(2)
    expect(result.params.productId).toBe('42')
  })
})

describe('RouteGuard', () => {
  it('allows when all guards pass', () => {
    const guard = new RouteGuard()
    guard.register(() => true)
    expect(guard.canActivate('/admin').allowed).toBe(true)
  })

  it('blocks when guard fails', () => {
    const guard = new RouteGuard()
    guard.register(() => '/login')
    expect(guard.canActivate('/admin').allowed).toBe(false)
    expect(guard.canActivate('/admin').redirect).toBe('/login')
  })
})
