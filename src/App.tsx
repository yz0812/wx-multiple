import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StatusType = "success" | "error" | "info";

type StatusState = {
  type: StatusType;
  message: string;
} | null;

function App() {
  const [directory, setDirectory] = useState("");
  const [count, setCount] = useState(2);
  const [isScanning, setIsScanning] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  useEffect(() => {
    void scanDirectory();
  }, []);

  const statusClassName = useMemo(() => {
    if (!status) {
      return "hidden";
    }

    if (status.type === "success") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status.type === "error") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
  }, [status]);

  async function scanDirectory() {
    setIsScanning(true);
    setStatus({ type: "info", message: "正在扫描常见微信安装目录..." });

    try {
      const result = await invoke<string | null>("scan_weixin_path");

      if (result) {
        setDirectory(result);
        setStatus(null);
      } else {
        setStatus({ type: "info", message: "未找到常见安装目录，请手动填写或选择。" });
      }
    } catch (error) {
      setStatus({ type: "error", message: formatError(error) });
    } finally {
      setIsScanning(false);
    }
  }

  async function pickDirectory() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择微信目录",
      });

      if (typeof selected === "string") {
        setDirectory(selected);
        setStatus({ type: "success", message: `已选择目录：${selected}` });
      }
    } catch (error) {
      setStatus({ type: "error", message: formatError(error) });
    }
  }

  async function handleLaunch() {
    const value = directory.trim();

    if (!value) {
      setStatus({ type: "error", message: "请先填写微信目录。" });
      return;
    }

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      setStatus({ type: "error", message: "启动数量必须在 1 到 10 之间。" });
      return;
    }

    setIsLaunching(true);
    setStatus({ type: "info", message: "正在启动微信，请稍候..." });

    try {
      const result = await invoke<string>("launch_weixin_instances", {
        directory: value,
        count,
      });

      setStatus({ type: "success", message: result });
    } catch (error) {
      setStatus({ type: "error", message: formatError(error) });
    } finally {
      setIsLaunching(false);
    }
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-4 pt-6 pb-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <CardTitle>微信多开</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`rounded-xl border px-4 py-3 text-sm ${statusClassName}`}>
            {status?.message}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Label htmlFor="weixin-directory" className="shrink-0">
                微信目录
              </Label>
              <Input
                id="weixin-directory"
                className="flex-1"
                value={directory}
                onChange={(event) => setDirectory(event.target.value)}
                placeholder="例如：D:\\Program Files\\Tencent\\Weixin"
              />
            </div>
            <p className="text-xs text-slate-500">支持输入目录，也支持直接粘贴 Weixin.exe 完整路径。</p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => void scanDirectory()}
              disabled={isScanning || isLaunching}
            >
              {isScanning ? "扫描中..." : "重新扫描"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => void pickDirectory()} disabled={isLaunching}>
              选择目录
            </Button>
          </div>

          <div className="flex items-end gap-3">
            <div className="w-28 space-y-2">
              <Label htmlFor="launch-count">启动数量</Label>
              <Input
                id="launch-count"
                type="number"
                min={1}
                max={10}
                step={1}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                disabled={isLaunching}
              />
            </div>

            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={() => void handleLaunch()}
              disabled={isLaunching || isScanning}
            >
              {isLaunching ? "启动中..." : "开始启动"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "发生未知错误，请稍后重试。";
}

export default App;
