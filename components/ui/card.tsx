import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(34,31,51,0.04),0_8px_24px_-16px_rgba(34,31,51,0.16)]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
