import { Briefcase, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Position {
  id: number;
  name: string;
  color?: string;
}

interface WorkLocation {
  id: number;
  name: string;
  color?: string;
}

interface Agency {
  id: number;
  name: string;
  code?: string;
}

interface ContractType {
  id: number;
  name: string;
  code: string;
  color?: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  positionId?: number;
  workLocationId?: number;
  agencyId?: number;
  department?: string;
  status?: "active" | "on_leave" | "terminated";
  hireDate: string;
  terminationDate?: string;
  contractTypeId?: number;
}

interface EditEmployeeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEdit?: (data: EditEmployeeData) => void;
  employee?: Employee | null;
  departments?: Department[];
  positions?: Position[];
  workLocations?: WorkLocation[];
  agencies?: Agency[];
  contractTypes?: ContractType[];
}

export interface EditEmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  positionId?: number;
  workLocationId?: number;
  department?: string;
  agencyId?: number | null;
  status?: "active" | "on_leave" | "terminated";
  hireDate: string;
  terminationDate?: string;
  contractTypeId?: number | null;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  onEdit,
  employee,
  departments = [],
  positions = [],
  workLocations = [],
  agencies = [],
  contractTypes = [],
}: EditEmployeeDialogProps) {
  const { t } = useTranslation();

  // Initialize form with employee data
  const [formData, setFormData] = useState<EditEmployeeData>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    positionId: undefined,
    workLocationId: undefined,
    department: "",
    status: "active",
    hireDate: "",
    terminationDate: "",
    contractTypeId: undefined,
  });

  // Update form when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || "",
        positionId: employee.positionId,
        workLocationId: employee.workLocationId,
        department: employee.department || "",
        agencyId: employee.agencyId ?? null,
        status: employee.status as "active" | "on_leave" | "terminated",
        hireDate: employee.hireDate,
        terminationDate: employee.terminationDate || "",
        contractTypeId: employee.contractTypeId,
      });
    }
  }, [employee]);

  const updateFormData = <K extends keyof EditEmployeeData>(
    field: K,
    value: EditEmployeeData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.hireDate;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open && employee) {
      setFormData({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || "",
        positionId: employee.positionId,
        workLocationId: employee.workLocationId,
        department: employee.department || "",
        status: employee.status as "active" | "on_leave" | "terminated",
        hireDate: employee.hireDate,
        terminationDate: employee.terminationDate || "",
        contractTypeId: employee.contractTypeId,
      });
    }
    onOpenChange?.(open);
  };

  const handleSubmit = () => {
    onEdit?.(formData);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("employeeDetail.editEmployee")}</DialogTitle>
          <DialogDescription>
            {t("employeeDetail.editEmployeeDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Personal Info Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
              <User className="h-4 w-4" />
              {t("employeeDetail.personalInfo")}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("employeeDetail.firstName")} *
                </Label>
                <Input
                  id="firstName"
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder={t("employeeDetail.firstName")}
                  value={formData.firstName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t("employeeDetail.lastName")} *
                </Label>
                <Input
                  id="lastName"
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder={t("employeeDetail.lastName")}
                  value={formData.lastName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("employeeDetail.email")} *</Label>
              <Input
                id="email"
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder={t("employeeDetail.email")}
                type="email"
                value={formData.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("employeeDetail.phone")}</Label>
              <Input
                id="phone"
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder={t("employeeDetail.phone")}
                type="tel"
                value={formData.phone}
              />
            </div>
          </div>

          {/* Professional Info Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
              <Briefcase className="h-4 w-4" />
              {t("employeeDetail.jobAndContract")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("employeeDetail.status")}</Label>
              <Select
                onValueChange={(value) =>
                  updateFormData(
                    "status",
                    value as "active" | "on_leave" | "terminated"
                  )
                }
                value={formData.status}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t("employeeDetail.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t("employeeDetail.statusActive")}
                  </SelectItem>
                  <SelectItem value="on_leave">
                    {t("employeeDetail.statusOnLeave")}
                  </SelectItem>
                  <SelectItem value="terminated">
                    {t("employeeDetail.statusTerminated")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t("employeeDetail.position")}</Label>
              <Select
                onValueChange={(value) =>
                  updateFormData(
                    "positionId",
                    value ? Number.parseInt(value, 10) : undefined
                  )
                }
                value={formData.positionId?.toString() || ""}
              >
                <SelectTrigger id="position">
                  <SelectValue
                    placeholder={t("employeeDetail.selectPosition")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLocation">
                {t("employeeDetail.workLocation")}
              </Label>
              <Select
                onValueChange={(value) =>
                  updateFormData(
                    "workLocationId",
                    value ? Number.parseInt(value, 10) : undefined
                  )
                }
                value={formData.workLocationId?.toString() || ""}
              >
                <SelectTrigger id="workLocation">
                  <SelectValue
                    placeholder={t("employeeDetail.selectWorkLocation")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {workLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">{t("employees.agency")}</Label>
              <Select
                onValueChange={(value) =>
                  updateFormData(
                    "agencyId",
                    value ? Number.parseInt(value, 10) : null
                  )
                }
                value={formData.agencyId?.toString() || ""}
              >
                <SelectTrigger id="agency">
                  <SelectValue placeholder={t("employees.selectAgency")} />
                </SelectTrigger>
                <SelectContent>
                  {agencies.length > 0 && (
                    <>
                      {agencies.map((agency) => (
                        <SelectItem
                          key={agency.id}
                          value={agency.id.toString()}
                        >
                          {agency.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                {t("employeeDetail.department")}
              </Label>
              <Select
                onValueChange={(value) => updateFormData("department", value)}
                value={formData.department || ""}
              >
                <SelectTrigger id="department">
                  <SelectValue
                    placeholder={t("employeeDetail.selectDepartment")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractType">
                {t("employeeDetail.contractType")}
              </Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("contractTypeId", Number(value))
                }
                value={formData.contractTypeId?.toString() || ""}
              >
                <SelectTrigger id="contractType">
                  <SelectValue
                    placeholder={t("employeeDetail.contractType")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id.toString()}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hireDate">
                  {t("employeeDetail.hireDate")} *
                </Label>
                <Input
                  id="hireDate"
                  onChange={(e) => updateFormData("hireDate", e.target.value)}
                  type="date"
                  value={formData.hireDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminationDate">
                  {t("employeeDetail.terminationDate")}
                </Label>
                <Input
                  id="terminationDate"
                  onChange={(e) =>
                    updateFormData(
                      "terminationDate",
                      e.target.value || undefined
                    )
                  }
                  type="date"
                  value={formData.terminationDate}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="flex-1"
            disabled={!isFormValid}
            onClick={handleSubmit}
            type="button"
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}