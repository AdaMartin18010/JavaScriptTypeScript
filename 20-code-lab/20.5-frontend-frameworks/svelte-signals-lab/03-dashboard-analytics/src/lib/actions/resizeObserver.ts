import type { Action } from 'svelte/action';

export interface ResizeObserverOptions {
	onResize?: (entry: ResizeObserverEntry) => void;
}

/**
 * Svelte Action：监听容器尺寸变化
 * 用法: <div use:resizeObserver={{ onResize: (entry) => { ... } }}>
 */
export const resizeObserver: Action<HTMLElement, ResizeObserverOptions | undefined> = (
	node,
	options
) => {
	let callback = options?.onResize;

	const observer = new ResizeObserver((entries) => {
		for (const entry of entries) {
			callback?.(entry);
		}
	});

	observer.observe(node);

	return {
		update(newOptions) {
			callback = newOptions?.onResize;
		},
		destroy() {
			observer.disconnect();
		}
	};
};
