import { Upload } from "lucide-react";

interface BulkImportTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onImport: () => void;
  loading?: boolean;
}

export function BulkImportTextarea({
  value,
  onChange,
  placeholder,
  onImport,
  loading = false,
}: BulkImportTextareaProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
      />
      <button
        type="button"
        onClick={onImport}
        disabled={loading || !value.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors"
      >
        <Upload size={14} />
        {loading ? "Importando..." : "Importar em massa"}
      </button>
    </div>
  );
}
