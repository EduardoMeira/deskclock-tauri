import { Trash2 } from "lucide-react";
import type { Category } from "@domain/entities/Category";
import type { UUID } from "@shared/types";

interface CategoryCardProps {
  category: Category;
  onDelete: (id: UUID) => void;
}

export function CategoryCard({ category, onDelete }: CategoryCardProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-md group">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-100 truncate">{category.name}</span>
        <span
          className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
            category.defaultBillable
              ? "bg-emerald-900/40 text-emerald-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {category.defaultBillable ? "B" : "N"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onDelete(category.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all shrink-0"
        title="Excluir categoria"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
