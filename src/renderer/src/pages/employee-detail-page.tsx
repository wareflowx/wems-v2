import { Users } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { ErrorDisplay } from "@/components/ui/error-display";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAgencies,
  useCaces,
  useContracts,
  useDepartments,
  useDrivingAuthorizations,
  useEmployee,
  useMedicalVisits,
  useOnlineTrainings,
  usePositions,
  useUpdateEmployee,
  useWorkLocations,
  useEmployees,
} from "@/hooks";

export function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { employeeId } = useParams({ from: "/employees/$employeeId" });
  const parsedEmployeeId = parseInt(employeeId, 10);

  // Fetch employee data
  const { data: employee, isLoading, error } = useEmployee(parsedEmployeeId);

  // Fetch all employees to find the employee if useEmployee doesn't work
  const { data: employees = [] } = useEmployees();
  const employeeData = employee || employees.find((e) => e.id === parsedEmployeeId);

  // Fetch related data
  const { data: positions = [] } = usePositions();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: contracts = [] } = useContracts();
  const { data: departments = [] } = useDepartments();
  const { data: agencies = [] } = useAgencies();
  const { data: caces = [] } = useCaces();
  const { data: medicalVisits = [] } = useMedicalVisits();
  const { data: drivingAuthorizations = [] } = useDrivingAuthorizations();
  const { data: onlineTrainings = [] } = useOnlineTrainings();
  const updateEmployee = useUpdateEmployee();

  // Get employee's current contract
  const currentContract = useMemo(() => {
    if (!employeeData) return undefined;
    const now = new Date();
    return contracts.find((c) => {
      if (c.employeeId !== employeeData.id || !c.isActive) {
        return false;
      }
      if (c.endDate && new Date(c.endDate) < now) {
        return false;
      }
      return true;
    });
  }, [contracts, employeeData]);

  // Get employee's data
  const employeeCaces = useMemo(() => {
    if (!employeeData) return [];
    return caces.filter((c) => c.employeeId === employeeData.id);
  }, [caces, employeeData]);

  const employeeMedicalVisits = useMemo(() => {
    if (!employeeData) return [];
    return medicalVisits.filter((m) => m.employeeId === employeeData.id);
  }, [medicalVisits, employeeData]);

  const employeeDrivingAuthorizations = useMemo(() => {
    if (!employeeData) return [];
    return drivingAuthorizations.filter((d) => d.employeeId === employeeData.id);
  }, [drivingAuthorizations, employeeData]);

  const employeeTrainings = useMemo(() => {
    if (!employeeData) return [];
    return onlineTrainings.filter((t) => t.employeeId === employeeData.id);
  }, [onlineTrainings, employeeData]);

  // Get position and work location
  const position = employeeData ? positions.find((p) => p.id === employeeData.positionId) : undefined;
  const workLocation = employeeData ? workLocations.find((w) => w.id === employeeData.workLocationId) : undefined;

  // Check if certifications are valid (not expired)
  const now = new Date();

  // Valid CACES: at least one not expired
  const validCaces = employeeCaces.some((c: any) => c.expirationDate && new Date(c.expirationDate) > now);

  // Valid medical visit: at least one not expired and completed
  const validMedicalVisit = employeeMedicalVisits.some(
    (m: any) => m.status === "completed" && m.expirationDate && new Date(m.expirationDate) > now
  );

  // Valid driving authorization: at least one not expired
  const validDrivingAuth = employeeDrivingAuthorizations.some(
    (d: any) => d.expirationDate && new Date(d.expirationDate) > now
  );

  // Valid training: at least one completed
  const validTraining = employeeTrainings.some((t: any) => t.status === "completed");

  // Can drive: all 4 conditions met
  const canDrive = validCaces && validMedicalVisit && validDrivingAuth && validTraining;
  const partialDriving = (validCaces ? 1 : 0) + (validMedicalVisit ? 1 : 0) + (validDrivingAuth ? 1 : 0) + (validTraining ? 1 : 0);

  // Tab state for document types
  const [activeTab, setActiveTab] = useState<"caces" | "medicalVisits" | "drivingAuthorizations" | "trainings">("caces");

  const tabs: { key: "caces" | "medicalVisits" | "drivingAuthorizations" | "trainings"; label: string; count: number; valid: boolean }[] = [
    { key: "caces", label: "CACES", count: employeeCaces.length, valid: validCaces },
    { key: "medicalVisits", label: "Medical Visits", count: employeeMedicalVisits.length, valid: validMedicalVisit },
    { key: "drivingAuthorizations", label: "Driving Authorizations", count: employeeDrivingAuthorizations.length, valid: validDrivingAuth },
    { key: "trainings", label: "Trainings", count: employeeTrainings.length, valid: validTraining },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !employeeData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <ErrorDisplay
          message={t(
            "employees.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          title={t("employees.errorLoading", "Failed to load employee")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 overflow-y-auto">
      <div className="min-h-full space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <PageHeaderCard
            description={employeeData.email || "-"}
            icon={<Users className="h-4 w-4" />}
            title={`${employeeData.firstName} ${employeeData.lastName}`}
          />

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <EditEmployeeDialog
              employee={employeeData}
              contract={currentContract}
              departments={departments}
              agencies={agencies}
              onEdit={(data) => updateEmployee.mutate(data)}
              onOpenChange={() => {}}
              open={false}
              positions={positions}
              workLocations={workLocations}
            />
          </div>

          {/* Info Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">
                {t("common.employeeId")}
              </p>
              <p className="mt-0.5 font-medium text-sm">
                {employeeData.id.toString().padStart(4, "0")}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">
                {t("employees.position")}
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {position?.name || "-"}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">
                {t("employees.workLocation")}
              </p>
              <p className="mt-0.5 text-sm">
                {workLocation?.name || "-"}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-muted-foreground text-xs">
                {t("employeeDetail.startDate")}
              </p>
              <p className="mt-0.5 text-sm">
                {employeeData.hireDate}
              </p>
            </Card>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-6 space-y-4">
          {/* Can Drive Status */}
          <div>
            {canDrive ? (
              <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-3 py-1.5 font-medium text-green-600 text-xs">
                Authorized to drive
              </span>
            ) : partialDriving > 0 ? (
              <span className="inline-flex items-center rounded-md border border-yellow-500/25 bg-yellow-500/15 px-3 py-1.5 font-medium text-yellow-600 text-xs">
                Partial ({partialDriving}/4)
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md border border-red-500/25 bg-red-500/15 px-3 py-1.5 font-medium text-red-600 text-xs">
                Not authorized
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
                <StatusBadge color={tab.valid ? "green" : "red"} className="ml-2">
                  {tab.valid ? "Valid" : "Invalid"}
                </StatusBadge>
              </button>
            ))}
          </div>

          {/* CACES Table */}
          {activeTab === "caces" && (
            <div className="overflow-x-auto rounded-lg border bg-card">
              {employeeCaces.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 px-4">No CACES records</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Category</TableHead>
                      <TableHead className="px-4">Obtained</TableHead>
                      <TableHead className="px-4">Expires</TableHead>
                      <TableHead className="px-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeCaces.map((c: any) => {
                      const isExpired = c.expirationDate && new Date(c.expirationDate) < now;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="px-4 font-medium">{c.category}</TableCell>
                          <TableCell className="px-4">{c.dateObtained}</TableCell>
                          <TableCell className="px-4">{c.expirationDate}</TableCell>
                          <TableCell className="px-4">
                            {isExpired ? (
                              <StatusBadge color="red">Expired</StatusBadge>
                            ) : (
                              <StatusBadge color="green">Valid</StatusBadge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Medical Visits Table */}
          {activeTab === "medicalVisits" && (
            <div className="overflow-x-auto rounded-lg border bg-card">
              {employeeMedicalVisits.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 px-4">No medical visits</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Type</TableHead>
                      <TableHead className="px-4">Scheduled</TableHead>
                      <TableHead className="px-4">Completed</TableHead>
                      <TableHead className="px-4">Fitness</TableHead>
                      <TableHead className="px-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeMedicalVisits.map((m: any) => {
                      const isExpired = m.expirationDate && new Date(m.expirationDate) < now;
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="px-4 font-medium">{m.type}</TableCell>
                          <TableCell className="px-4">{m.scheduledDate || "-"}</TableCell>
                          <TableCell className="px-4">{m.actualDate || "-"}</TableCell>
                          <TableCell className="px-4">{m.fitnessStatus || "-"}</TableCell>
                          <TableCell className="px-4">
                            {m.status === "completed" ? (
                              isExpired ? (
                                <StatusBadge color="red">Expired</StatusBadge>
                              ) : (
                                <StatusBadge color="green">Valid</StatusBadge>
                              )
                            ) : m.status === "scheduled" ? (
                              <StatusBadge color="blue">Scheduled</StatusBadge>
                            ) : m.status === "overdue" ? (
                              <StatusBadge color="orange">Overdue</StatusBadge>
                            ) : (
                              <span className="text-muted-foreground">{m.status}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Driving Authorizations Table */}
          {activeTab === "drivingAuthorizations" && (
            <div className="overflow-x-auto rounded-lg border bg-card">
              {employeeDrivingAuthorizations.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 px-4">No driving authorizations</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">License</TableHead>
                      <TableHead className="px-4">Obtained</TableHead>
                      <TableHead className="px-4">Expires</TableHead>
                      <TableHead className="px-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeDrivingAuthorizations.map((d: any) => {
                      const isExpired = d.expirationDate && new Date(d.expirationDate) < now;
                      return (
                        <TableRow key={d.id}>
                          <TableCell className="px-4 font-medium">{d.licenseCategory}</TableCell>
                          <TableCell className="px-4">{d.dateObtained}</TableCell>
                          <TableCell className="px-4">{d.expirationDate}</TableCell>
                          <TableCell className="px-4">
                            {isExpired ? (
                              <StatusBadge color="red">Expired</StatusBadge>
                            ) : (
                              <StatusBadge color="green">Valid</StatusBadge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Online Trainings Table */}
          {activeTab === "trainings" && (
            <div className="overflow-x-auto rounded-lg border bg-card">
              {employeeTrainings.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 px-4">No trainings</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Training</TableHead>
                      <TableHead className="px-4">Provider</TableHead>
                      <TableHead className="px-4">Completed</TableHead>
                      <TableHead className="px-4">Expires</TableHead>
                      <TableHead className="px-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeTrainings.map((t: any) => {
                      const isExpired = t.expirationDate && new Date(t.expirationDate) < now;
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="px-4 font-medium">{t.trainingName}</TableCell>
                          <TableCell className="px-4">{t.trainingProvider || "-"}</TableCell>
                          <TableCell className="px-4">{t.completionDate}</TableCell>
                          <TableCell className="px-4">{t.expirationDate || "-"}</TableCell>
                          <TableCell className="px-4">
                            {t.status === "completed" ? (
                              isExpired ? (
                                <StatusBadge color="orange">Expired</StatusBadge>
                              ) : (
                                <StatusBadge color="green">Completed</StatusBadge>
                              )
                            ) : t.status === "in_progress" ? (
                              <StatusBadge color="blue">In Progress</StatusBadge>
                            ) : (
                              <StatusBadge color="red">{t.status}</StatusBadge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
