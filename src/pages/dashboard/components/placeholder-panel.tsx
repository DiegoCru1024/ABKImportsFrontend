import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

interface PlaceholderPanelProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PlaceholderPanel({ title, description, icon: Icon = Construction }: PlaceholderPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-6">
      <div className="relative mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/50">
          <Icon className="h-6 w-6 text-amber-500" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white">
          <Construction className="h-3 w-3" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">{description}</p>
      <div className="mt-3 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60">
        <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">En desarrollo</span>
      </div>
    </div>
  );
}
