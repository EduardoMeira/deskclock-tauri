import { ProjectsPanel } from "@presentation/components/ProjectsPanel";
import { CategoriesPanel } from "@presentation/components/CategoriesPanel";

export function DataPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-xl font-semibold mb-6 text-gray-100">Dados</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectsPanel />
        <CategoriesPanel />
      </div>
    </div>
  );
}
