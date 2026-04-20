/**
 * 系统信息展示组件
 * 通过 Tauri 后端命令获取操作系统、硬件等底层信息
 */
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Cpu,
  HardDrive,
  Monitor,
  Layers,
  Clock,
  Globe,
  MemoryStick,
} from "lucide-react";
import { formatDate } from "@lib/utils";
import type { SystemInfoData } from "@types/index";

/** 信息卡片属性 */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps): JSX.Element {
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-lg font-semibold text-card-foreground truncate">{value}</p>
    </div>
  );
}

export default function SystemInfo(): JSX.Element {
  const [info, setInfo] = useState<SystemInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    /** 获取系统信息 */
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const data = await invoke<SystemInfoData>("get_system_info");
        setInfo(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="animate-pulse">正在获取系统信息...</div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="h-full flex items-center justify-center text-destructive">
        获取系统信息失败: {error || "未知错误"}
      </div>
    );
  }

  const cards: InfoCardProps[] = [
    { icon: <Monitor className="w-4 h-4" />, label: "操作系统", value: info.platform },
    { icon: <Clock className="w-4 h-4" />, label: "系统版本", value: info.version },
    { icon: <Globe className="w-4 h-4" />, label: "主机名", value: info.hostname },
    { icon: <Layers className="w-4 h-4" />, label: "系统架构", value: info.arch },
    { icon: <Cpu className="w-4 h-4" />, label: "CPU 核心数", value: `${info.cpuCores} 核` },
    { icon: <MemoryStick className="w-4 h-4" />, label: "总内存", value: `${info.totalMemory} MB` },
    { icon: <HardDrive className="w-4 h-4" />, label: "应用版本", value: info.appVersion },
    { icon: <Clock className="w-4 h-4" />, label: "当前时间", value: formatDate(Date.now()) },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">系统信息</h2>
      <p className="text-muted-foreground mb-6">
        通过 Tauri 后端安全调用操作系统 API 获取的底层信息
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <InfoCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">关于安全模型</p>
        <p>
          Tauri v2 采用基于能力的权限系统（Capabilities）。
          前端无法直接访问系统 API，所有调用都必须通过 Rust 后端暴露的命令（Command），
          并在 tauri.conf.json 中显式声明所需权限。
        </p>
      </div>
    </div>
  );
}
