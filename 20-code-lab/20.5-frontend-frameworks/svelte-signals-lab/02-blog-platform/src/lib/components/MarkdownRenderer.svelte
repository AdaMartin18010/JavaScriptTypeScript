<script lang="ts">
	/**
	 * Markdown 渲染组件（简化版）
	 *
	 * 本组件将纯文本 Markdown 转换为 HTML。
	 * 生产环境建议使用 MDsveX 或 marked 库。
	 *
	 * 支持的语法：
	 * - 标题 (# ## ###)
	 * - 段落与换行
	 * - 粗体 (**text**)
	 * - 斜体 (*text*)
	 * - 行内代码 (`code`)
	 * - 代码块 (```lang\ncode\n```)
	 * - 无序列表 (- item)
	 * - 有序列表 (1. item)
	 * - 链接 ([text](url))
	 */

	interface Props {
		source: string;
	}

	let { source }: Props = $props();

	// 简单的 Markdown → HTML 转换器
	function parseMarkdown(md: string): string {
		let html = md;

		// 转义 HTML 特殊字符（防止 XSS）
		html = html
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		// 代码块 (```lang\ncode\n```)
		html = html.replace(
			/```(\w+)?\n([\s\S]*?)```/g,
			(_match, _lang, code) => `<pre><code>${code.trim()}</code></pre>`
		);

		// 标题 ###
		html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
		// 标题 ##
		html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
		// 标题 #
		html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

		// 粗体
		html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		// 斜体
		html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

		// 行内代码
		html = html.replace(/`(.+?)`/g, '<code>$1</code>');

		// 链接
		html = html.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener">$1</a>'
		);

		// 无序列表
		html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
		html = html.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');

		// 有序列表
		html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

		// 段落（将连续的非标签行包裹为 <p>）
		const lines = html.split('\n');
		const result: string[] = [];
		let inParagraph = false;

		for (const line of lines) {
			const trimmed = line.trim();
			const isBlock = /^<(h[1-6]|ul|ol|li|pre|blockquote)/.test(trimmed);
			const isCloseBlock = /^<\/(h[1-6]|ul|ol|li|pre|blockquote)/.test(trimmed);

			if (trimmed === '') {
				if (inParagraph) {
					result.push('</p>');
					inParagraph = false;
				}
			} else if (isBlock || isCloseBlock) {
				if (inParagraph) {
					result.push('</p>');
					inParagraph = false;
				}
				result.push(trimmed);
			} else {
				if (!inParagraph) {
					result.push('<p>');
					inParagraph = true;
				}
				result.push(trimmed);
			}
		}

		if (inParagraph) {
			result.push('</p>');
		}

		return result.join('\n');
	}

	let renderedHtml = $derived(parseMarkdown(source));
</script>

<div class="markdown-body">
	{@html renderedHtml}
</div>

<style>
	.markdown-body :global(h1) {
		font-size: 2rem;
		margin: 1.5rem 0 1rem;
		color: #1a1a2e;
		border-bottom: 2px solid #ff3e00;
		padding-bottom: 0.5rem;
	}

	.markdown-body :global(h2) {
		font-size: 1.5rem;
		margin: 1.5rem 0 0.75rem;
		color: #1a1a2e;
	}

	.markdown-body :global(h3) {
		font-size: 1.25rem;
		margin: 1.25rem 0 0.5rem;
		color: #333;
	}

	.markdown-body :global(p) {
		margin-bottom: 1rem;
		line-height: 1.8;
	}

	.markdown-body :global(ul) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.markdown-body :global(li) {
		margin-bottom: 0.4rem;
	}

	.markdown-body :global(a) {
		color: #ff3e00;
		text-decoration: none;
	}

	.markdown-body :global(a:hover) {
		text-decoration: underline;
	}

	.markdown-body :global(code) {
		background: #f1f3f5;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
		color: #e83e8c;
	}

	.markdown-body :global(pre) {
		background: #1a1a2e;
		color: #f8f8f2;
		padding: 1.25rem;
		border-radius: 10px;
		overflow-x: auto;
		margin: 1rem 0;
	}

	.markdown-body :global(pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
	}

	.markdown-body :global(strong) {
		color: #1a1a2e;
	}
</style>
