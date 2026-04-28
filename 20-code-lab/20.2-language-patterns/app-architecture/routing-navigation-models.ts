/**
 * @file routing-navigation-models.ts
 * @category Application Architecture → Routing
 * @model Routing and Navigation
 */

export interface RouteNode {
  path: string
  component: string
  children?: RouteNode[]
}

export function matchRoute(urlPath: string, routes: RouteNode[]): RouteNode | null {
  const segments = urlPath.split('/').filter(Boolean)
  for (const route of routes) {
    const routeSegments = route.path.split('/').filter(Boolean)
    if (segments.length !== routeSegments.length) continue
    const match = routeSegments.every((seg, i) => seg.startsWith(':') || seg === segments[i])
    if (match) return route
  }
  return null
}

export function matchNestedRoute(urlPath: string, routes: RouteNode[]): { matched: RouteNode[]; params: Record<string, string> } {
  const matched: RouteNode[] = []
  const params: Record<string, string> = {}
  const segments = urlPath.split('/').filter(Boolean)
  let currentRoutes = routes
  let segIndex = 0

  while (segIndex < segments.length && currentRoutes) {
    const segment = segments[segIndex]
    const route = currentRoutes.find((r) => {
      const parts = r.path.split('/').filter(Boolean)
      if (parts.length !== 1) return false
      return parts[0].startsWith(':') || parts[0] === segment
    })
    if (!route) break
    const part = route.path.split('/').filter(Boolean)[0]
    if (part.startsWith(':')) {
      params[part.slice(1)] = segment
    }
    matched.push(route)
    currentRoutes = route.children ?? []
    segIndex++
  }

  return { matched, params }
}

export class RouteGuard {
  private guards: ((to: string) => boolean | string)[] = []

  register(guard: (to: string) => boolean | string): void {
    this.guards.push(guard)
  }

  canActivate(to: string): { allowed: boolean; redirect?: string } {
    for (const guard of this.guards) {
      const result = guard(to)
      if (result !== true) {
        return { allowed: false, redirect: typeof result === 'string' ? result : undefined }
      }
    }
    return { allowed: true }
  }
}
