import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Check, CreditCard, Mail, User } from "lucide-react"

export function CardDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* 基础卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>账户设置</CardTitle>
          <CardDescription>管理您的账户信息和偏好设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" placeholder="输入您的姓名" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="输入您的邮箱" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">取消</Button>
          <Button>保存更改</Button>
        </CardFooter>
      </Card>

      {/* 通知卡片 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">通知</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12</div>
          <p className="text-xs text-muted-foreground">
            过去24小时内收到12条新通知
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full">
            <Check className="mr-2 h-4 w-4" />
            全部标记为已读
          </Button>
        </CardFooter>
      </Card>

      {/* 支付卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>支付方式</CardTitle>
          <CardDescription>添加或管理您的支付方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <CreditCard className="h-6 w-6" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Visa 尾号 4242</p>
              <p className="text-xs text-muted-foreground">有效期至 12/25</p>
            </div>
            <Button variant="ghost" size="sm">
              编辑
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            添加新卡片
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
