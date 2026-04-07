import { Plus, Search } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgencySearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  onAddClick: () => void;
}

export const AgencySearchBar = memo(function AgencySearchBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
}: AgencySearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("agencies.search")}
          value={search}
        />
      </div>
      <Select
        onValueChange={(v) => onStatusFilterChange(v as typeof statusFilter)}
        value={statusFilter}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t("agencies.status")} />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">{t("common.all")}</SelectItem>
          <SelectItem value="active">{t("agencies.active")}</SelectItem>
          <SelectItem value="inactive">{t("agencies.inactive")}</SelectItem>
        </SelectContent>
      </Select>
      <Button className="ml-auto gap-2" onClick={onAddClick}>
        <Plus className="h-4 w-4" />
        {t("agencies.addAgency")}
      </Button>
    </div>
  );
});
