function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('.vp-doc div[class*="language-"]');
  codeBlocks.forEach((block) => {
    if (block.hasAttribute("data-sb-enhanced")) return;
    block.setAttribute("data-sb-enhanced", "true");
    const langClass = Array.from(block.classList).find((c) => c.startsWith("language-"));
    const lang = langClass ? langClass.replace("language-", "") : "";
    if (!["ts", "typescript", "js", "javascript"].includes(lang)) return;
    const codeEl = block.querySelector("code");
    if (!codeEl) return;
    const code = codeEl.textContent || "";
    const btnContainer = document.createElement("div");
    btnContainer.className = "sb-action-bar";
    btnContainer.style.cssText = "display:flex;justify-content:flex-end;padding:4px 12px;border-top:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);";
    const sbBtn = document.createElement("button");
    sbBtn.className = "sb-run-btn";
    sbBtn.innerHTML = "<span>⚡</span> 在 StackBlitz 打开";
    sbBtn.title = "在 StackBlitz 中运行此代码";
    sbBtn.onclick = () => openInStackBlitz(code, lang);
    btnContainer.appendChild(sbBtn);
    block.appendChild(btnContainer);
  });
}
async function openInStackBlitz(code, lang) {
  try {
    const sdk = await import("@stackblitz/sdk");
    const ext = lang.startsWith("ts") ? "ts" : "js";
    const isTs = ext === "ts";
    sdk.default.openProject({
      title: "JSTS Code Lab",
      description: "从 Awesome JS/TS Ecosystem 代码实验室运行",
      template: isTs ? "node" : "javascript",
      files: {
        [`index.${ext}`]: code,
        "package.json": JSON.stringify({
          name: "jsts-lab-run",
          version: "1.0.0",
          type: "module",
          scripts: {
            start: isTs ? "tsx index.ts" : "node index.js"
          },
          devDependencies: isTs ? { typescript: "^5.8", tsx: "^4.0" } : {}
        }, null, 2)
      }
    }, {
      newWindow: true,
      openFile: `index.${ext}`
    });
  } catch (err) {
    console.error("Failed to open StackBlitz:", err);
    alert("打开 StackBlitz 失败，请检查网络连接");
  }
}
function init() {
  enhanceCodeBlocks();
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("popstate", () => setTimeout(init, 300));
}
