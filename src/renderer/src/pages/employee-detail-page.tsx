import { ArrowLeft, Edit, Users } from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { ErrorDisplay } from "@/components/ui/error-display";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to="/employees"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Link>
        </div>

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
        <div className="mt-6 space-y-6">
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

          {/* CACES Table */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
              CACES
              {validCaces ? (
                <span className="text-green-600 text-xs font-normal">Valid</span>
              ) : (
                <span className="text-red-600 text-xs font-normal">Invalid</span>
              )}
            </h3>
            {employeeCaces.length === 0 ? (
              <p className="text-muted-foreground text-sm">No CACES records</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Obtained</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employeeCaces.map((c: any) => {
                      const isExpired = c.expirationDate && new Date(c.expirationDate) < now;
                      return (
                        <tr key={c.id}>
                          <td className="px-3 py-2 font-medium">{c.category}</td>
                          <td className="px-3 py-2">{c.dateObtained}</td>
                          <td className="px-3 py-2">{c.expirationDate}</td>
                          <td className="px-3 py-2">
                            {isExpired ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : (
                              <span className="text-green-600 font-medium">Valid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Medical Visits Table */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
              Medical Visits
              {validMedicalVisit ? (
                <span className="text-green-600 text-xs font-normal">Valid</span>
              ) : (
                <span className="text-red-600 text-xs font-normal">Invalid</span>
              )}
            </h3>
            {employeeMedicalVisits.length === 0 ? (
              <p className="text-muted-foreground text-sm">No medical visits</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Scheduled</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Completed</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fitness</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employeeMedicalVisits.map((m: any) => {
                      const isExpired = m.expirationDate && new Date(m.expirationDate) < now;
                      return (
                        <tr key={m.id}>
                          <td className="px-3 py-2 font-medium">{m.type}</td>
                          <td className="px-3 py-2">{m.scheduledDate || "-"}</td>
                          <td className="px-3 py-2">{m.actualDate || "-"}</td>
                          <td className="px-3 py-2">{m.fitnessStatus || "-"}</td>
                          <td className="px-3 py-2">
                            {m.status === "completed" ? (
                              isExpired ? (
                                <span className="text-red-600 font-medium">Expired</span>
                              ) : (
                                <span className="text-green-600 font-medium">Valid</span>
                              )
                            ) : m.status === "scheduled" ? (
                              <span className="text-blue-600 font-medium">Scheduled</span>
                            ) : m.status === "overdue" ? (
                              <span className="text-orange-600 font-medium">Overdue</span>
                            ) : (
                              <span className="text-muted-foreground">{m.status}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Driving Authorizations Table */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
              Driving Authorizations
              {validDrivingAuth ? (
                <span className="text-green-600 text-xs font-normal">Valid</span>
              ) : (
                <span className="text-red-600 text-xs font-normal">Invalid</span>
              )}
            </h3>
            {employeeDrivingAuthorizations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No driving authorizations</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">License</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Obtained</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employeeDrivingAuthorizations.map((d: any) => {
                      const isExpired = d.expirationDate && new Date(d.expirationDate) < now;
                      return (
                        <tr key={d.id}>
                          <td className="px-3 py-2 font-medium">{d.licenseCategory}</td>
                          <td className="px-3 py-2">{d.dateObtained}</td>
                          <td className="px-3 py-2">{d.expirationDate}</td>
                          <td className="px-3 py-2">
                            {isExpired ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : (
                              <span className="text-green-600 font-medium">Valid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Online Trainings Table */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
              Trainings
              {validTraining ? (
                <span className="text-green-600 text-xs font-normal">Completed</span>
              ) : (
                <span className="text-red-600 text-xs font-normal">Missing</span>
              )}
            </h3>
            {employeeTrainings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No trainings</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Training</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Provider</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Completed</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employeeTrainings.map((t: any) => {
                      const isExpired = t.expirationDate && new Date(t.expirationDate) < now;
                      return (
                        <tr key={t.id}>
                          <td className="px-3 py-2 font-medium">{t.trainingName}</td>
                          <td className="px-3 py-2">{t.trainingProvider || "-"}</td>
                          <td className="px-3 py-2">{t.completionDate}</td>
                          <td className="px-3 py-2">{t.expirationDate || "-"}</td>
                          <td className="px-3 py-2">
                            {t.status === "completed" ? (
                              isExpired ? (
                                <span className="text-orange-600 font-medium">Expired</span>
                              ) : (
                                <span className="text-green-600 font-medium">Completed</span>
                              )
                            ) : t.status === "in_progress" ? (
                              <span className="text-blue-600 font-medium">In Progress</span>
                            ) : (
                              <span className="text-red-600 font-medium">{t.status}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
