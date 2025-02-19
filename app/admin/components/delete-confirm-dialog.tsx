"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiKey } from "../types";

type DeleteConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  apiKey: ApiKey | null;
};

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  apiKey,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus API Key", {
        description: "Terjadi kesalahan saat menghapus. Silakan coba lagi.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !apiKey) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Konfirmasi Penghapusan</h2>
        <p className="mb-6">
          Apakah Anda yakin ingin menghapus API Key &quot;{apiKey.name}&quot;?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
