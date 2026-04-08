interface AgencyCodeBadgeProps {
  code: string | null;
}

export function AgencyCodeBadge({ code }: AgencyCodeBadgeProps) {
  if (!code) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
      {code}
    </span>
  );
}
