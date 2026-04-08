interface AgencyStatusBadgeProps {
  isActive: boolean;
  labels: { active: string; inactive: string };
}

export function AgencyStatusBadge({
  isActive,
  labels,
}: AgencyStatusBadgeProps) {
  return isActive ? (
    <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
      {labels.active}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
      {labels.inactive}
    </span>
  );
}
