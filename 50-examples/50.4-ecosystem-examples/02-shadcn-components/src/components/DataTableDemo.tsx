import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// 示例数据类型
interface Invoice {
  id: string
  invoice: string
  paymentStatus: "Paid" | "Pending" | "Unpaid" | "Cancelled"
  totalAmount: string
  paymentMethod: string
  date: string
}

// 示例数据
const invoices: Invoice[] = [
  {
    id: "1",
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "信用卡",
    date: "2024-03-15",
  },
  {
    id: "2",
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
    date: "2024-03-14",
  },
  {
    id: "3",
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "银行转账",
    date: "2024-03-13",
  },
  {
    id: "4",
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "信用卡",
    date: "2024-03-12",
  },
  {
    id: "5",
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
    date: "2024-03-11",
  },
  {
    id: "6",
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "银行转账",
    date: "2024-03-10",
  },
  {
    id: "7",
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "信用卡",
    date: "2024-03-09",
  },
  {
    id: "8",
    invoice: "INV008",
    paymentStatus: "Paid",
    totalAmount: "$650.00",
    paymentMethod: "PayPal",
    date: "2024-03-08",
  },
]

// 状态标签组件
function StatusBadge({ status }: { status: Invoice["paymentStatus"] }) {
  const variants: Record<
    Invoice["paymentStatus"],
    { className: string; label: string }
  > = {
    Paid: { className: "bg-green-100 text-green-800 hover:bg-green-100", label: "已支付" },
    Pending: { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100", label: "处理中" },
    Unpaid: { className: "bg-red-100 text-red-800 hover:bg-red-100", label: "未支付" },
    Cancelled: { className: "bg-gray-100 text-gray-800 hover:bg-gray-100", label: "已取消" },
  }

  const { className, label } = variants[status]

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export function DataTableDemo() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(invoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInvoices = invoices.slice(startIndex, endIndex)

  const getTotalAmount = () => {
    return invoices
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.replace("$", "")), 0)
      .toFixed(2)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableCaption>最近发票列表</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>发票号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead>日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.paymentStatus} />
                </TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                <TableCell>{invoice.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页控制 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          显示第 {startIndex + 1}-{Math.min(endIndex, invoices.length)} 条，
          共 {invoices.length} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <span className="text-sm">
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 汇总信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">总订单数</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">总金额</p>
          <p className="text-2xl font-bold">${getTotalAmount()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">已支付订单</p>
          <p className="text-2xl font-bold">
            {invoices.filter((i) => i.paymentStatus === "Paid").length}
          </p>
        </div>
      </div>
    </div>
  )
}
