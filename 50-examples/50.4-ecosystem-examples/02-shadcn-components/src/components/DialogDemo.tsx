import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Settings, Trash2, AlertTriangle } from "lucide-react"

export function DialogDemo() {
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <div className="flex flex-wrap gap-4">
      {/* 基础对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            编辑个人资料
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑个人资料</DialogTitle>
            <DialogDescription>
              在此修改您的个人信息。完成后点击保存。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                姓名
              </Label>
              <Input
                id="name"
                defaultValue="张三"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名
              </Label>
              <Input
                id="username"
                defaultValue="@zhangsan"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            打开设置
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>系统设置</DialogTitle>
            <DialogDescription>
              配置应用程序的偏好设置
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">深色模式</p>
                <p className="text-sm text-muted-foreground">
                  切换应用程序的主题
                </p>
              </div>
              <Button variant="outline" size="sm">
                切换
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">邮件通知</p>
                <p className="text-sm text-muted-foreground">
                  接收每日摘要邮件
                </p>
              </div>
              <Button variant="outline" size="sm">
                启用
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自动保存</p>
                <p className="text-sm text-muted-foreground">
                  自动保存您的工作
                </p>
              </div>
              <Button variant="outline" size="sm">
                禁用
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">重置</Button>
            <Button>应用设置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除对话框 */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            删除账户
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">确认删除</DialogTitle>
            <DialogDescription className="text-center">
              此操作无法撤销。这将永久删除您的账户和所有相关数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpenDelete(false)
                alert("账户已删除！")
              }}
              className="w-full sm:w-auto"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
