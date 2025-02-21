export default function ProtectedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Halaman Protected
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Selamat! Anda telah berhasil mengakses halaman protected dengan API
          Key yang valid.
        </p>
      </div>
    </div>
  );
}
