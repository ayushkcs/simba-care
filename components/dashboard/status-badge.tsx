import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "confirmed" | "cancelled" }) {
  if (status === "cancelled") {
    return (
      <Badge variant="rose">
        <XCircle className="h-3.5 w-3.5" aria-hidden />
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge variant="emerald">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      Confirmed
    </Badge>
  );
}
