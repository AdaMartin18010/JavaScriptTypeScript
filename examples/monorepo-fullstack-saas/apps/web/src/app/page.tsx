"use client";

import { useEffect, useState } from "react";
import { Button } from "@saas/ui";
import { apiClient } from "@/lib/api";

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<HealthResponse>("/health");
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">
        SaaS Monorepo Starter
      </h1>
      <p className="text-muted-foreground max-w-md text-center">
        Next.js 15 + NestJS + Prisma + PostgreSQL + Redis
      </p>

      <div className="flex flex-col items-center gap-4 mt-4">
        <Button onClick={fetchHealth} disabled={loading}>
          {loading ? "Checking..." : "Check API Health"}
        </Button>

        {health && (
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm min-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="font-semibold">API Online</span>
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">{health.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-medium">{health.version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Timestamp</dt>
                <dd className="font-medium">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive min-w-[280px]">
            <p className="text-sm font-medium">API Error</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
