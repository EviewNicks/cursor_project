/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { ApiKey, ApiKeyFormData } from "../types";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { RocketLaunchIcon, BeakerIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

type ApiKeyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: ApiKey) => void;
  apiKey?: ApiKey | null;
};

export function ApiKeyDialog({
  isOpen,
  onClose,
  onSubmit,
  apiKey,
}: ApiKeyDialogProps) {
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: "",
    status: "active",
    type: "dev",
  });

  const [monthlyLimit, setMonthlyLimit] = useState("1000");

  useEffect(() => {
    if (apiKey) {
      setFormData({
        name: apiKey.name,
        status: apiKey.status,
        type: apiKey.type,
      });
    } else {
      setFormData({
        name: "",
        status: "active",
        type: "dev",
      });
      setMonthlyLimit("1000");
    }
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi nama
    if (formData.name.trim().length < 3) {
      toast.error("Nama terlalu pendek", {
        description: "Nama API key harus minimal 3 karakter.",
      });
      return;
    }

    // Validasi monthly limit
    const limit = parseInt(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      toast.error("Batasan tidak valid", {
        description: "Batasan bulanan harus berupa angka positif.",
      });
      return;
    }

    const newApiKey: ApiKey = {
      id: apiKey?.id || crypto.randomUUID(),
      key:
        apiKey?.key ||
        `tvly-${formData.type}-${crypto.randomUUID().slice(0, 20)}`,
      createdAt: apiKey?.createdAt || new Date().toISOString(),
      usage: apiKey?.usage || 0,
      monthlyLimit: limit,
      ...formData,
    };

    try {
      onSubmit(newApiKey);
    } catch (error) {
      toast.error("Terjadi kesalahan", {
        description: "Gagal menyimpan API key. Silakan coba lagi.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl mx-4 relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold">
            {apiKey ? "Edit API Key" : "Buat API Key Baru"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Masukkan nama dan batasan untuk API key baru.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Nama Key
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  — Nama unik untuk mengidentifikasi key ini
                </span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20 outline-none transition-shadow"
                placeholder="contoh: Production API Key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Tipe Key
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  — Pilih environment untuk key ini
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "prod" }))
                  }
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors ${
                    formData.type === "prod"
                      ? "border-black dark:border-white"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <RocketLaunchIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Production</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Rate limited to 1,000 requests/minute
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "dev" }))
                  }
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors ${
                    formData.type === "dev"
                      ? "border-black dark:border-white"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <BeakerIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Development</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Rate limited to 100 requests/minute
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-medium" htmlFor="monthlyLimit">
                  Batasan Bulanan
                </label>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Info batasan bulanan"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Jika penggunaan gabungan dari semua key melebihi batas plan,
                semua request akan ditolak.
              </p>
              <input
                type="number"
                id="monthlyLimit"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20 outline-none transition-shadow"
                min="0"
                required
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              {apiKey ? "Simpan Perubahan" : "Buat API Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
