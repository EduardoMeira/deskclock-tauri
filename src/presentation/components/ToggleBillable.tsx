interface ToggleBillableProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export function ToggleBillable({ value, onChange, label }: ToggleBillableProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
        value
          ? "bg-emerald-900/40 border-emerald-700 text-emerald-400"
          : "bg-gray-800 border-gray-600 text-gray-400"
      }`}
      title={value ? "Billable — clique para alternar" : "Non-billable — clique para alternar"}
    >
      {label ?? (value ? "Billable" : "Non-billable")}
    </button>
  );
}
