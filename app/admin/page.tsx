"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiKey } from "./types";
import { ApiKeyDialog } from "./components/api-key-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { formatDate } from "@/lib/utils";
import {
  KeyIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
} from "@/lib/hooks/use-api-keys";

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useApiKeys(page, limit, search);
  const createApiKey = useCreateApiKey();
  const updateApiKey = useUpdateApiKey();
  const deleteApiKey = useDeleteApiKey();

  const [isOpenAddDialog, setIsOpenAddDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const handleAddKey = async (newKey: ApiKey) => {
    try {
      await createApiKey.mutateAsync(newKey);
      setIsOpenAddDialog(false);
      toast.success("API Key berhasil dibuat", {
        description: `${newKey.name} telah ditambahkan ke daftar API key Anda.`,
      });
    } catch (error) {
      toast.error("Gagal membuat API Key", {
        description:
          "Terjadi kesalahan saat membuat API key. Silakan coba lagi.",
      });
    }
  };

  const handleEditKey = async (updatedKey: ApiKey) => {
    try {
      await updateApiKey.mutateAsync(updatedKey);
      setSelectedApiKey(null);
      setIsOpenAddDialog(false);
      toast.success("API Key berhasil diperbarui", {
        description: `Perubahan pada ${updatedKey.name} telah disimpan.`,
      });
    } catch (error) {
      toast.error("Gagal memperbarui API Key", {
        description:
          "Terjadi kesalahan saat memperbarui API key. Silakan coba lagi.",
      });
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const keyToDelete = data?.data.find((key) => key.id === id);
      await deleteApiKey.mutateAsync(id);
      setIsOpenDeleteDialog(false);
      setSelectedApiKey(null);
      toast.success("API Key berhasil dihapus", {
        description: `${keyToDelete?.name} telah dihapus dari daftar API key Anda.`,
      });
    } catch (error) {
      toast.error("Gagal menghapus API Key", {
        description:
          "Terjadi kesalahan saat menghapus API key. Silakan coba lagi.",
      });
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (key: string, name: string) => {
    navigator.clipboard
      .writeText(key)
      .then(() => {
        toast.success("API Key berhasil disalin", {
          description: `API key untuk ${name} telah disalin ke clipboard.`,
        });
      })
      .catch(() => {
        toast.error("Gagal menyalin API Key", {
          description: "Terjadi kesalahan saat menyalin ke clipboard.",
        });
      });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Kembali ke Beranda"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">API Keys</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kelola API keys untuk mengakses Tavily API
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpenAddDialog(true)}
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 h-10 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Tambah API Key</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari API key..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Memuat data...
              </div>
            ) : data?.data.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Belum ada API key. Klik "Tambah API Key" untuk membuat key baru.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nama
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      API Key
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tipe
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Usage
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dibuat
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data?.data.map((apiKey) => (
                    <tr
                      key={apiKey.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <KeyIcon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{apiKey.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <span>
                            {showKey[apiKey.id]
                              ? apiKey.key
                              : "•".repeat(apiKey.key.length)}
                          </span>
                          <button
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label={
                              showKey[apiKey.id]
                                ? "Sembunyikan API Key"
                                : "Tampilkan API Key"
                            }
                          >
                            {showKey[apiKey.id] ? (
                              <EyeSlashIcon className="w-4 h-4" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleCopyKey(apiKey.key, apiKey.name)
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label="Salin API Key"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {apiKey.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span>{apiKey.usage.toLocaleString()} credits</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                            apiKey.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {apiKey.status === "active" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {formatDate(new Date(apiKey.createdAt))}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setIsOpenAddDialog(true);
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label="Edit API Key"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setIsOpenDeleteDialog(true);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            aria-label="Hapus API Key"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <ApiKeyDialog
        isOpen={isOpenAddDialog}
        onClose={() => {
          setIsOpenAddDialog(false);
          setSelectedApiKey(null);
        }}
        onSubmit={selectedApiKey ? handleEditKey : handleAddKey}
        apiKey={selectedApiKey}
      />

      <DeleteConfirmDialog
        isOpen={isOpenDeleteDialog}
        onClose={() => {
          setIsOpenDeleteDialog(false);
          setSelectedApiKey(null);
        }}
        onConfirm={() => selectedApiKey && handleDeleteKey(selectedApiKey.id)}
        apiKey={selectedApiKey}
      />
    </div>
  );
}
