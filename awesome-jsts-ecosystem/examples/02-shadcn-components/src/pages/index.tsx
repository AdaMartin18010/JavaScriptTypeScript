import { ButtonDemo } from "@/components/ButtonDemo"
import { CardDemo } from "@/components/CardDemo"
import { FormDemo } from "@/components/FormDemo"
import { DialogDemo } from "@/components/DialogDemo"
import { DataTableDemo } from "@/components/DataTableDemo"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">shadcn/ui 组件示例</h1>
          <p className="text-muted-foreground mt-2">
            使用 React + TypeScript + Tailwind CSS 构建的高质量 UI 组件
          </p>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Button 示例 */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Button 按钮</h2>
            <p className="text-muted-foreground">
              支持多种变体、尺寸和状态的按钮组件
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <ButtonDemo />
          </div>
        </section>

        {/* Card 示例 */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Card 卡片</h2>
            <p className="text-muted-foreground">
              用于展示内容的容器组件，支持头部、内容区和底部操作区
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <CardDemo />
          </div>
        </section>

        {/* Form 示例 */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Form 表单</h2>
            <p className="text-muted-foreground">
              包含验证、错误处理和状态管理的完整表单示例
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <FormDemo />
          </div>
        </section>

        {/* Dialog 示例 */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Dialog 对话框</h2>
            <p className="text-muted-foreground">
              模态对话框组件，支持多种使用场景
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <DialogDemo />
          </div>
        </section>

        {/* DataTable 示例 */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">DataTable 数据表格</h2>
            <p className="text-muted-foreground">
              带有分页和状态标签的数据表格组件
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <DataTableDemo />
          </div>
        </section>

        {/* 特性介绍 */}
        <section className="rounded-lg bg-muted p-8">
          <h2 className="text-2xl font-semibold mb-4">shadcn/ui 特性</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🎨 可定制</h3>
              <p className="text-muted-foreground">
                每个组件都是可复制的，您可以根据需要自由修改代码
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">⚡ 高性能</h3>
              <p className="text-muted-foreground">
                基于 Radix UI 构建，提供出色的可访问性和性能
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📘 TypeScript</h3>
              <p className="text-muted-foreground">
                完整的 TypeScript 支持，提供优秀的类型推断
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🎯 无障碍</h3>
              <p className="text-muted-foreground">
                遵循 WAI-ARIA 标准，支持键盘导航和屏幕阅读器
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">💅 Tailwind CSS</h3>
              <p className="text-muted-foreground">
                使用 Tailwind CSS 进行样式设置，易于自定义主题
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📦 轻量级</h3>
              <p className="text-muted-foreground">
                只安装需要的组件，无额外依赖负担
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 底部 */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>
            基于{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              shadcn/ui
            </a>{" "}
            构建 • 使用 Next.js + TypeScript + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
