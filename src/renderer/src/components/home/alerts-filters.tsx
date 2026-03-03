import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (value: string) => void;
  detailFilter: string;
  onDetailFilterChange: (value: string) => void;
  uniqueEmployees: string[];
  uniqueDetails: string[];
}

export function AlertsFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  severityFilter,
  onSeverityFilterChange,
  employeeFilter,
  onEmployeeFilterChange,
  detailFilter,
  onDetailFilterChange,
  uniqueEmployees,
  uniqueDetails,
}: AlertsFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("employees.search")}
          value={search}
        />
      </div>
      <Select onValueChange={onTypeFilterChange} value={typeFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("dashboard.filterByType")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("dashboard.allTypes")}</SelectItem>
          <SelectItem value="caces">{t("caces.title")}</SelectItem>
          <SelectItem value="medical">
            {t("medicalVisits.title")}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onSeverityFilterChange} value={severityFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("dashboard.filterBySeverity")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {t("dashboard.allSeverities")}
          </SelectItem>
          <SelectItem value="critical">{t("alerts.critical")}</SelectItem>
          <SelectItem value="warning">{t("alerts.warning")}</SelectItem>
          <SelectItem value="info">{t("alerts.info")}</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onEmployeeFilterChange} value={employeeFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("dashboard.filterByEmployee")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("dashboard.allEmployees")}</SelectItem>
          {uniqueEmployees.map((employee) => (
            <SelectItem key={employee} value={employee}>
              {employee}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={onDetailFilterChange} value={detailFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("dashboard.filterByDetail")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("dashboard.allDetails")}</SelectItem>
          {uniqueDetails.map((detail) => (
            <SelectItem key={detail} value={detail}>
              {detail}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
