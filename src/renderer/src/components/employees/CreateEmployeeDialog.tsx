import { Briefcase, Check, User } from "lucide-react";
import { useState } from "react";
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
import { usePositions, useWorkLocations } from "@/hooks";

interface CreateEmployeeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate?: (data: CreateEmployeeData) => void;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  positionId?: number;
  workLocationId?: number;
  contractType: string;
  department: string;
  status?: "active" | "on_leave" | "terminated";
  hireDate: string;
  contractEndDate?: string;
}

const steps = [
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Professional", icon: Briefcase },
  { id: 3, title: "Review", icon: Check },
];

export function CreateEmployeeDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateEmployeeDialogProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const { data: positions = [] } = usePositions();
  const { data: workLocations = [] } = useWorkLocations();

  // Form state - matches DB schema
  const [formData, setFormData] = useState<CreateEmployeeData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    positionId: undefined,
    workLocationId: undefined,
    contractType: "",
    department: "",
    hireDate: "",
    contractEndDate: "",
  });

  const updateFormData = <K extends keyof CreateEmployeeData>(
    field: K,
    value: CreateEmployeeData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onCreate?.(formData);
    // Close dialog after submit
    onOpenChange?.(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        positionId: undefined,
        workLocationId: undefined,
        contractType: "",
        department: "",
        hireDate: "",
        contractEndDate: "",
      });
      setCurrentStep(1);
    }
    onOpenChange?.(isOpen);
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          isValidEmail(formData.email)
        );
      case 2:
        return (
          formData.department && formData.contractType && formData.hireDate
        );
      default:
        return true;
    }
  };

  // Get position name for display
  const getPositionName = (id?: number) => {
    if (!id) {
      return "-";
    }
    return positions.find((p) => p.id === id)?.name || "-";
  };

  // Get work location name for display
  const getWorkLocationName = (id?: number) => {
    if (!id) {
      return "-";
    }
    return workLocations.find((w) => w.id === id)?.name || "-";
  };

  // Map contract value to display
  const getContractDisplay = (contract: string) => {
    const map: Record<string, string> = {
      CDI: "CDI",
      cdi: "CDI",
      CDD: "CDD",
      cdd: "CDD",
      Intérim: "Intérim",
      interim: "Intérim",
      Alternance: "Alternance",
      alternance: "Alternance",
    };
    return map[contract] || contract;
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("employees.addEmployee")}</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-6 flex w-full items-center justify-between">
          {steps.map((step, index) => (
            <div className="flex flex-1 items-center" key={step.id}>
              <div className="flex w-full flex-col items-center">
                <div className="flex w-full items-center">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground bg-background text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`mt-1 ml-2 text-xs ${
                      currentStep === step.id
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                {t("employeeDetail.identity")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("employeeDetail.firstName")} *
                  </Label>
                  <Input
                    id="firstName"
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
                    placeholder="John"
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
                    placeholder="Doe"
                    value={formData.lastName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("employeeDetail.email")} *</Label>
                  <Input
                    id="email"
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="john.doe@email.com"
                    type="email"
                    value={formData.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("employeeDetail.phone")}</Label>
                  <Input
                    id="phone"
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    type="tel"
                    value={formData.phone || ""}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                {t("employeeDetail.jobAndContract")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">
                    {t("employees.department")} *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      updateFormData("department", value)
                    }
                    value={formData.department}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder={t("employees.department")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Administration">
                        Administration
                      </SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Logistics">Logistics</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">{t("employees.position")} *</Label>
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
                      <SelectValue placeholder={t("employees.position")} />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem
                          key={position.id}
                          value={position.id.toString()}
                        >
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workLocation">
                    {t("employees.workLocation")}
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
                      <SelectValue placeholder={t("employees.workLocation")} />
                    </SelectTrigger>
                    <SelectContent>
                      {workLocations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract">
                    {t("employeeDetail.contractType")} *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      updateFormData("contractType", value)
                    }
                    value={formData.contractType}
                  >
                    <SelectTrigger id="contract">
                      <SelectValue
                        placeholder={t("employeeDetail.contractType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Intérim">Intérim</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">
                    {t("employeeDetail.startDate")} *
                  </Label>
                  <Input
                    id="hireDate"
                    onChange={(e) => updateFormData("hireDate", e.target.value)}
                    type="date"
                    value={formData.hireDate}
                  />
                </div>

                {/* Contract end date - optional for CDD/Intérim */}
                {["CDD", "Intérim", "Alternance"].includes(
                  formData.contractType
                ) && (
                  <div className="space-y-2">
                    <Label htmlFor="contractEndDate">
                      {t("contracts.endDate")}
                    </Label>
                    <Input
                      id="contractEndDate"
                      onChange={(e) =>
                        updateFormData("contractEndDate", e.target.value)
                      }
                      type="date"
                      value={formData.contractEndDate}
                    />
                    <p className="text-muted-foreground text-xs">
                      {t("contracts.endDateHint")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("common.confirm")}</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Personal Info Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground text-sm">
                    {t("employeeDetail.identity")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employeeDetail.fullName")}:
                      </span>
                      <span className="font-medium">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employeeDetail.email")}:
                      </span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employeeDetail.phone")}:
                      </span>
                      <span className="font-medium">
                        {formData.phone || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Info Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground text-sm">
                    {t("employeeDetail.jobAndContract")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employees.department")}:
                      </span>
                      <span className="font-medium">
                        {formData.department || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employees.position")}:
                      </span>
                      <span className="font-medium">
                        {getPositionName(formData.positionId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employees.workLocation")}:
                      </span>
                      <span className="font-medium">
                        {getWorkLocationName(formData.workLocationId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employeeDetail.contractType")}:
                      </span>
                      <span className="font-medium">
                        {getContractDisplay(formData.contractType)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("employeeDetail.startDate")}:
                      </span>
                      <span className="font-medium">
                        {formData.hireDate || "-"}
                      </span>
                    </div>
                    {formData.contractEndDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("contracts.endDate")}:
                        </span>
                        <span className="font-medium">
                          {formData.contractEndDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button
              onClick={() => onOpenChange?.(false)}
              type="button"
              variant="outline"
            >
              {t("common.cancel")}
            </Button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevious}
                  type="button"
                  variant="outline"
                >
                  {t("common.previous")}
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button
                  disabled={!isStepValid()}
                  onClick={handleNext}
                  type="button"
                >
                  {t("common.next")}
                </Button>
              ) : (
                <Button onClick={handleSubmit} type="button">
                  {t("common.confirm")}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
