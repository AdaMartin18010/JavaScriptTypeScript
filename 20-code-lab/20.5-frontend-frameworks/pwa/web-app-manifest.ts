/**
 * # Web App Manifest 配置
 *
 * Manifest 是 PWA 的"身份证明"，告诉浏览器如何安装和显示应用。
 */

/** Web App Manifest 结构 */
export interface WebAppManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url: string;
  display: "fullscreen" | "standalone" | "minimal-ui" | "browser";
  background_color: string;
  theme_color: string;
  orientation?: "any" | "natural" | "landscape" | "portrait";
  icons: Array<{
    src: string;
    sizes: string;
    type?: string;
    purpose?: "any" | "maskable" | "monochrome";
  }>;
  screenshots?: Array<{
    src: string;
    sizes: string;
    type?: string;
    form_factor?: "narrow" | "wide";
    label?: string;
  }>;
  categories?: string[];
  shortcuts?: Array<{
    name: string;
    short_name?: string;
    description?: string;
    url: string;
    icons?: Array<{ src: string; sizes: string }>;
  }>;
  related_applications?: Array<{
    platform: string;
    url: string;
    id?: string;
  }>;
  prefer_related_applications?: boolean;
  scope?: string;
  id?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
}

/**
 * 创建推荐的 PWA Manifest。
 */
export function createManifest(options: {
  name: string;
  startUrl?: string;
  themeColor?: string;
  iconSizes?: number[];
}): WebAppManifest {
  const { name, startUrl = "/", themeColor = "#000000", iconSizes = [72, 96, 128, 144, 152, 192, 384, 512] } = options;

  return {
    name,
    short_name: name.slice(0, 12),
    start_url: startUrl,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    icons: iconSizes.map((size) => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: size >= 192 ? "any maskable" : "any",
    })),
    screenshots: [
      {
        src: "/screenshots/narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "手机端界面",
      },
      {
        src: "/screenshots/wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "桌面端界面",
      },
    ],
    categories: ["productivity", "utilities"],
    shortcuts: [
      {
        name: "新建任务",
        short_name: "新建",
        url: "/tasks/new",
        icons: [{ src: "/icons/shortcut-new.png", sizes: "96x96" }],
      },
    ],
  };
}

/**
 * 生成 manifest.json 的字符串。
 */
export function generateManifestJson(manifest: WebAppManifest): string {
  return JSON.stringify(manifest, null, 2);
}

/**
 * 检测 PWA 安装状态。
 */
export function checkPWAInstallStatus(): {
  isStandalone: boolean;
  displayMode: string;
  canInstall: boolean;
} {
  const displayMode =
    (window.matchMedia("(display-mode: standalone)").matches && "standalone") ||
    (window.matchMedia("(display-mode: fullscreen)").matches && "fullscreen") ||
    (window.matchMedia("(display-mode: minimal-ui)").matches && "minimal-ui") ||
    "browser";

  return {
    isStandalone: displayMode !== "browser",
    displayMode,
    canInstall: "BeforeInstallPromptEvent" in window,
  };
}
