import { cn } from "@/lib/utils";

export function ToothLogo({
  animated = true,
  size = "sm",
  className,
}: {
  animated?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  const dims =
    size === "lg"
      ? { box: "h-16 w-16 rounded-2xl", svg: "h-10 w-10" }
      : { box: "h-10 w-10 rounded-xl", svg: "h-6 w-6" };

  return (
    <span
      className={cn(
        "simba-wiggle-group relative inline-flex shrink-0",
        size === "lg" ? "h-16 w-16" : "h-10 w-10",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex items-center justify-center bg-[linear-gradient(135deg,var(--warm-1),var(--warm-2)_55%,var(--warm-3))] ring-1 ring-inset ring-white/50 shadow-[0_4px_12px_-5px_rgba(194,86,46,0.5)]",
          dims.box,
        )}
      >
        <svg
          viewBox="0 0 120 144"
          className={cn(dims.svg, "simba-wiggle-target", animated && "simba-bob")}
          role="img"
          aria-label="SIMBA Care tooth logo"
        >
          <path
            d="M60 10 C36 10 20 25 20 52 C20 76 26 90 33 110 C37 123 47 132 53 122 C58 114 57 101 60 101 C63 101 62 114 67 122 C73 132 83 123 87 110 C94 90 100 76 100 52 C100 25 84 10 60 10 Z"
            fill="#ffffff"
          />
          {/* gloss highlight */}
          <ellipse cx="44" cy="38" rx="9" ry="14" fill="#ffffff" opacity="0.6" />
          {/* happy eyes */}
          <circle cx="49" cy="58" r="5" fill="#7a3315" />
          <circle cx="73" cy="58" r="5" fill="#7a3315" />
          {/* cheerful smile */}
          <path
            d="M48 78 Q60 92 72 78"
            stroke="#7a3315"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}
