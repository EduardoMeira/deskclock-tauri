import { Trash2 } from "lucide-react";
import type { Project } from "@domain/entities/Project";
import type { UUID } from "@shared/types";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: UUID) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-md group">
      <span className="text-sm text-gray-100 truncate">{project.name}</span>
      <button
        type="button"
        onClick={() => onDelete(project.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
        title="Excluir projeto"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
