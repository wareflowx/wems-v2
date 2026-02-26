import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// Medical Visit type from DB (without calculated fields)
interface MedicalVisitFromDB {
  id: number;
  employeeId: number;
  type: "periodique" | "reprise" | "initiale" | "embauche";
  scheduledDate: string;
  actualDate: string | null;
  status: "scheduled" | "completed" | "overdue" | "cancelled";
  fitnessStatus: "Apt" | "Apt partiel" | "Inapte" | null;
  attachmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Extended type with calculated fields
export interface MedicalVisit extends MedicalVisitFromDB {
  daysUntil: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// Calculate daysUntil and auto-update status based on scheduledDate
function calculateVisitStatus(scheduledDate: string, currentStatus: string): { daysUntil: number; status: "scheduled" | "completed" | "overdue" | "cancelled" } {
  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return { daysUntil: 0, status: currentStatus };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(scheduledDate);
  scheduled.setHours(0, 0, 0, 0);

  const diffTime = scheduled.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: "scheduled" | "overdue";
  if (daysUntil < 0) {
    status = "overdue";
  } else {
    status = "scheduled";
  }

  return { daysUntil, status };
}

// Add calculated fields to visits data
function enrichVisitsWithStatus(
  visits: MedicalVisitFromDB[],
  employees?: { id: number; firstName: string; lastName: string }[]
): MedicalVisit[] {
  return visits.map((visit) => {
    const employee = employees?.find((e) => e.id === visit.employeeId);
    const { daysUntil, status } = calculateVisitStatus(visit.scheduledDate, visit.status);
    return {
      ...visit,
      daysUntil,
      status: visit.status === "completed" || visit.status === "cancelled" ? visit.status : status,
      employee: employee
        ? { id: employee.id, firstName: employee.firstName, lastName: employee.lastName }
        : undefined,
    };
  });
}

// Hook for fetching medical visits list
export function useMedicalVisits() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.medicalVisits.lists(),
    queryFn: async () => {
      const [visitsData, employeesData] = await Promise.all([
        db.getMedicalVisits(),
        db.getEmployees(),
      ]);
      return enrichVisitsWithStatus(visitsData, employeesData);
    },
    enabled: orpcReady,
  });
}

// Hook for fetching medical visits by employee
export function useMedicalVisitsByEmployee(employeeId: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.medicalVisits.byEmployee(employeeId),
    queryFn: async () => {
      const [visitsData, employeesData] = await Promise.all([
        db.getMedicalVisitsByEmployee(employeeId),
        db.getEmployees(),
      ]);
      return enrichVisitsWithStatus(visitsData, employeesData);
    },
    enabled: orpcReady && !!employeeId,
  });
}

// Hook for fetching single medical visit
export function useMedicalVisit(id: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.medicalVisits.detail(id),
    queryFn: async () => {
      const [visitsData, employeesData] = await Promise.all([
        db.getMedicalVisits(),
        db.getEmployees(),
      ]);
      const visit = visitsData.find((v) => v.id === id);
      if (!visit) return null;
      return enrichVisitsWithStatus([visit], employeesData)[0];
    },
    enabled: orpcReady && !!id,
  });
}

// Hook for creating medical visit
export function useCreateMedicalVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: {
      employeeId: number;
      type: "periodique" | "reprise" | "initiale" | "embauche";
      scheduledDate: string;
      actualDate?: string;
      status?: "scheduled" | "completed" | "overdue" | "cancelled";
      fitnessStatus?: "Apt" | "Apt partiel" | "Inapte";
      attachmentId?: string;
    }) => db.createMedicalVisit(input),

    onMutate: async (newVisit) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.medicalVisits.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.medicalVisits.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as MedicalVisit[]);
        });

      const optimisticVisit: MedicalVisit = {
        id: Date.now(),
        employeeId: newVisit.employeeId,
        type: newVisit.type,
        scheduledDate: newVisit.scheduledDate,
        actualDate: newVisit.actualDate || null,
        status: newVisit.status || "scheduled",
        fitnessStatus: newVisit.fitnessStatus || null,
        attachmentId: newVisit.attachmentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        daysUntil: 0,
      };

      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalVisits.lists() },
        (old: MedicalVisit[] = []) => [...old, optimisticVisit]
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: "Failed to create medical visit",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalVisits.lists(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() });
    },
  });
}

// Hook for updating medical visit
export function useUpdateMedicalVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: {
      id: number;
      type?: "periodique" | "reprise" | "initiale" | "embauche";
      scheduledDate?: string;
      actualDate?: string | null;
      status?: "scheduled" | "completed" | "overdue" | "cancelled";
      fitnessStatus?: "Apt" | "Apt partiel" | "Inapte" | null;
      attachmentId?: string | null;
    }) => db.updateMedicalVisit(input),

    onMutate: async (updatedVisit) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.medicalVisits.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.medicalVisits.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as MedicalVisit[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalVisits.lists() },
        (old: MedicalVisit[] = []) =>
          old.map((visit) => {
            if (visit.id !== updatedVisit.id) return visit;
            const updated = { ...visit, ...updatedVisit };
            // Recalculate status if scheduledDate changed
            if (updatedVisit.scheduledDate) {
              const { daysUntil, status } = calculateVisitStatus(
                updated.scheduledDate,
                updated.status
              );
              return { ...updated, daysUntil, status };
            }
            return updated;
          })
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: "Failed to update medical visit",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalVisits.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalVisits.details(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() });
    },
  });
}

// Hook for deleting medical visit
export function useDeleteMedicalVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteMedicalVisit(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.medicalVisits.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.medicalVisits.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as MedicalVisit[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalVisits.lists() },
        (old: MedicalVisit[] = []) => old.filter((visit) => visit.id !== id)
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: "Failed to delete medical visit",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalVisits.lists(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() });
    },
  });
}
