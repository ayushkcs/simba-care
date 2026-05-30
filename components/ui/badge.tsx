import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-surface-2 text-muted ring-line",
        coral: "bg-accent-soft text-accent ring-accent/20",
        amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
