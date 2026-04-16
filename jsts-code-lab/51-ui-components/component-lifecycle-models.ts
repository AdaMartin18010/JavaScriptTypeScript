/**
 * @file component-lifecycle-models.ts
 * @category UI Components → Lifecycle
 * @model Component Lifecycle
 */

export interface LifecycleModel {
  framework: 'react' | 'vue' | 'angular' | 'svelte'
  mount: () => void
  update: () => void
  unmount: () => void
}

export class ReactLifecycleModel implements LifecycleModel {
  framework = 'react' as const
  mount() { console.log('React: componentDidMount / useEffect') }
  update() { console.log('React: componentDidUpdate / useEffect deps change') }
  unmount() { console.log('React: componentWillUnmount / useEffect cleanup') }
}

export class VueLifecycleModel implements LifecycleModel {
  framework = 'vue' as const
  mount() { console.log('Vue: onMounted') }
  update() { console.log('Vue: onUpdated') }
  unmount() { console.log('Vue: onUnmounted') }
}

export function compareLifecycleHooks(): Record<string, string[]> {
  return {
    react: ['useEffect', 'useLayoutEffect'],
    vue: ['onMounted', 'onUpdated', 'onUnmounted'],
    angular: ['ngOnInit', 'ngOnChanges', 'ngOnDestroy'],
    svelte: ['onMount', 'beforeUpdate', 'afterUpdate', 'onDestroy'],
  }
}
