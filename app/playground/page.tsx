"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";

const PlaygroundPage = () => {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Set cookie dengan API Key ID yang valid
        Cookies.set("validApiKey", "true", { expires: 1 });

        toast.success("API Key Valid!", {
          description: result.message,
          duration: 2000,
        });

        setTimeout(() => {
          router.replace("/protected");
        }, 1000);
      } else {
        toast.error("Validasi Gagal", {
          description: result.message || "API Key tidak valid",
          duration: 3000,
        });
      }
    } catch (error: unknown) {
      toast.error("Terjadi Kesalahan", {
        description: "Gagal memvalidasi API Key. Silakan coba lagi.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>API Playground</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key Anda"
                required
                minLength={10}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memvalidasi..." : "Validasi API Key"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaygroundPage;
