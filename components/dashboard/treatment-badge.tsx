import {
  Activity,
  ClipboardCheck,
  Droplet,
  Sparkles,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TreatmentCategory } from "@/types";

const ICONS: Record<TreatmentCategory, LucideIcon> = {
  consultation: Stethoscope,
  cleaning: Sparkles,
  extraction: Syringe,
  "root-canal": Activity,
  filling: Droplet,
  whitening: Sparkles,
  checkup: ClipboardCheck,
  other: Stethoscope,
};

export function TreatmentBadge({
  category,
  label,
}: {
  category: TreatmentCategory;
  label: string;
}) {
  const Icon = ICONS[category] ?? ICONS.other;
  return (
    <Badge variant="neutral">
      <Icon className="h-3.5 w-3.5 text-primary/80" aria-hidden />
      {label}
    </Badge>
  );
}
