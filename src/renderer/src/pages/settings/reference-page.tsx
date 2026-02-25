import {
  Plus,
  Trash2,
  Save,
  Database,
  Sparkles,
  Building,
  Briefcase,
  FileText,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import {
  SettingsListCard,
  SettingsListCardHeader,
  SettingsListCardTitle,
  SettingsListCardCount,
  SettingsListCardBadge,
  SettingsListCardContent,
  SettingsListCardItemList,
  SettingsListCardItem,
  SettingsListCardItemIcon,
  SettingsListCardItemLabel,
  SettingsListCardItemActions,
  SettingsListCardFooter,
  SettingsListCardAddButton,
} from "@/components/ui/settings-list-card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AddItemDialog } from "@/components/ui/add-item-dialog";
import { EditItemDialog } from "@/components/ui/edit-item-dialog";
import { useState } from "react";
import {
  useDepartments,
  useJobTitles,
  useContractTypes,
  useAddDepartment,
  useAddJobTitle,
  useAddContractType,
  useUpdateDepartment,
  useUpdateJobTitle,
  useUpdateContractType,
  useDeleteDepartment,
  useDeleteJobTitle,
  useDeleteContractType,
} from "@/hooks";

export function SettingsReferencePage() {
  const { t } = useTranslation();

  const { data: departments = [], isLoading: isLoadingDepartments } = useDepartments();
  const { data: jobTitles = [], isLoading: isLoadingJobs } = useJobTitles();
  const { data: contractTypes = [], isLoading: isLoadingContracts } = useContractTypes();

  const addDepartment = useAddDepartment();
  const addJobTitle = useAddJobTitle();
  const addContractType = useAddContractType();
  const updateDepartment = useUpdateDepartment();
  const updateJobTitle = useUpdateJobTitle();
  const updateContractType = useUpdateContractType();
  const deleteDepartment = useDeleteDepartment();
  const deleteJobTitle = useDeleteJobTitle();
  const deleteContractType = useDeleteContractType();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "department" | "job" | "contract";
    value: string;
    index: number;
  }>({
    open: false,
    type: "department",
    value: "",
    index: -1,
  });

  const [addDialog, setAddDialog] = useState<{
    open: boolean;
    type: "department" | "job" | "contract";
  }>({
    open: false,
    type: "department",
  });

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: "department" | "job" | "contract";
    index: number;
    value: string;
  }>({
    open: false,
    type: "department",
    index: -1,
    value: "",
  });

  const handleDelete = (type: "department" | "job" | "contract", value: string, index: number) => {
    setDeleteDialog({ open: true, type, value, index });
  };

  const confirmDelete = () => {
    const { type, value } = deleteDialog;

    switch (type) {
      case "department":
        deleteDepartment.mutate(value, {
          onSuccess: () => {
            setDeleteDialog({ ...deleteDialog, open: false });
          }
        });
        break;
      case "job":
        deleteJobTitle.mutate(value, {
          onSuccess: () => {
            setDeleteDialog({ ...deleteDialog, open: false });
          }
        });
        break;
      case "contract":
        deleteContractType.mutate(value, {
          onSuccess: () => {
            setDeleteDialog({ ...deleteDialog, open: false });
          }
        });
        break;
    }
  };

  const handleAdd = (type: "department" | "job" | "contract") => {
    setAddDialog({ open: true, type });
  };

  const confirmAdd = (value: string) => {
    const { type } = addDialog;

    switch (type) {
      case "department":
        addDepartment.mutate(value, {
          onSuccess: () => {
            setAddDialog({ ...addDialog, open: false });
          }
        });
        break;
      case "job":
        addJobTitle.mutate(value, {
          onSuccess: () => {
            setAddDialog({ ...addDialog, open: false });
          }
        });
        break;
      case "contract":
        addContractType.mutate(value, {
          onSuccess: () => {
            setAddDialog({ ...addDialog, open: false });
          }
        });
        break;
    }
  };

  const getAddDialogTitle = () => {
    switch (addDialog.type) {
      case "department":
        return t("settingsReferenceData.addDepartmentDialog.title");
      case "job":
        return t("settingsReferenceData.addPositionDialog.title");
      case "contract":
        return t("settingsReferenceData.addContractTypeDialog.title");
    }
  };

  const getAddDialogDescription = () => {
    switch (addDialog.type) {
      case "department":
        return t("settingsReferenceData.addDepartmentDialog.description");
      case "job":
        return t("settingsReferenceData.addPositionDialog.description");
      case "contract":
        return t("settingsReferenceData.addContractTypeDialog.description");
    }
  };

  const getAddDialogLabel = () => {
    switch (addDialog.type) {
      case "department":
        return t("settingsReferenceData.addDepartmentDialog.label");
      case "job":
        return t("settingsReferenceData.addPositionDialog.label");
      case "contract":
        return t("settingsReferenceData.addContractTypeDialog.label");
    }
  };

  const getAddDialogPlaceholder = () => {
    switch (addDialog.type) {
      case "department":
        return t("settingsReferenceData.addDepartmentDialog.placeholder");
      case "job":
        return t("settingsReferenceData.addPositionDialog.placeholder");
      case "contract":
        return t("settingsReferenceData.addContractTypeDialog.placeholder");
    }
  };

  const handleEdit = (type: "department" | "job" | "contract", value: string, index: number) => {
    setEditDialog({ open: true, type, index, value });
  };

  const confirmEdit = (newValue: string) => {
    const { type, value: oldValue, index } = editDialog;

    switch (type) {
      case "department":
        updateDepartment.mutate(
          { oldName: oldValue, newName: newValue },
          {
            onSuccess: () => {
              setEditDialog({ ...editDialog, open: false });
            }
          }
        );
        break;
      case "job":
        updateJobTitle.mutate(
          { oldTitle: oldValue, newTitle: newValue },
          {
            onSuccess: () => {
              setEditDialog({ ...editDialog, open: false });
            }
          }
        );
        break;
      case "contract":
        updateContractType.mutate(
          { oldType: oldValue, newType: newValue },
          {
            onSuccess: () => {
              setEditDialog({ ...editDialog, open: false });
            }
          }
        );
        break;
    }
  };

  const getEditDialogTitle = () => {
    switch (editDialog.type) {
      case "department":
        return t("settingsReferenceData.editDepartmentDialog.title");
      case "job":
        return t("settingsReferenceData.editPositionDialog.title");
      case "contract":
        return t("settingsReferenceData.editContractTypeDialog.title");
    }
  };

  const getEditDialogDescription = () => {
    switch (editDialog.type) {
      case "department":
        return t("settingsReferenceData.editDepartmentDialog.description");
      case "job":
        return t("settingsReferenceData.editPositionDialog.description");
      case "contract":
        return t("settingsReferenceData.editContractTypeDialog.description");
    }
  };

  const getEditDialogLabel = () => {
    switch (editDialog.type) {
      case "department":
        return t("settingsReferenceData.editDepartmentDialog.label");
      case "job":
        return t("settingsReferenceData.editPositionDialog.label");
      case "contract":
        return t("settingsReferenceData.editContractTypeDialog.label");
    }
  };

  const getEditDialogPlaceholder = () => {
    switch (editDialog.type) {
      case "department":
        return t("settingsReferenceData.editDepartmentDialog.placeholder");
      case "job":
        return t("settingsReferenceData.editPositionDialog.placeholder");
      case "contract":
        return t("settingsReferenceData.editContractTypeDialog.placeholder");
    }
  };

  const getDeleteTitle = () => {
    switch (deleteDialog.type) {
      case "department":
        return t("settingsReferenceData.deleteDepartment");
      case "job":
        return t("settingsReferenceData.deletePosition");
      case "contract":
        return t("settingsReferenceData.deleteContractType");
    }
  };

  const getDeleteDescription = () => {
    return t("settingsReferenceData.deleteWarning", { value: deleteDialog.value });
  };

  if (isLoadingDepartments || isLoadingJobs || isLoadingContracts) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("settingsReferenceData.title")}
            description={t("settingsReferenceData.description")}
          />
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("settingsReferenceData.title")}
            description={t("settingsReferenceData.description")}
          />

          <div className="flex gap-2 flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SettingsListCard>
                <SettingsListCardHeader>
                  <div className="flex items-center gap-2">
                    <SettingsListCardTitle>
                      {t("settingsReferenceData.departments")}
                    </SettingsListCardTitle>
                    <SettingsListCardCount>
                      {departments.length}
                    </SettingsListCardCount>
                  </div>
                  <SettingsListCardBadge color="blue">
                    Structure
                  </SettingsListCardBadge>
                </SettingsListCardHeader>
                <SettingsListCardContent>
                  <SettingsListCardItemList>
                    {departments.map((dept, idx) => (
                      <SettingsListCardItem key={idx}>
                        <SettingsListCardItemIcon icon={Building} color="blue" />
                        <SettingsListCardItemLabel>{dept}</SettingsListCardItemLabel>
                        <SettingsListCardItemActions>
                          <div className="flex -space-x-px">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() => handleEdit("department", dept, idx)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("actions.edit")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() => handleDelete("department", dept, idx)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("actions.delete")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </SettingsListCardItemActions>
                      </SettingsListCardItem>
                    ))}
                  </SettingsListCardItemList>
                  <SettingsListCardFooter>
                    <SettingsListCardAddButton onClick={() => handleAdd("department")}>
                      {t("settingsReferenceData.addDepartment")}
                    </SettingsListCardAddButton>
                  </SettingsListCardFooter>
                </SettingsListCardContent>
              </SettingsListCard>

              <SettingsListCard>
                <SettingsListCardHeader>
                  <div className="flex items-center gap-2">
                    <SettingsListCardTitle>
                      {t("settingsReferenceData.positions")}
                    </SettingsListCardTitle>
                    <SettingsListCardCount>
                      {jobTitles.length}
                    </SettingsListCardCount>
                  </div>
                  <SettingsListCardBadge color="purple">
                    Rôles
                  </SettingsListCardBadge>
                </SettingsListCardHeader>
                <SettingsListCardContent>
                  <SettingsListCardItemList>
                    {jobTitles.map((job, idx) => (
                      <SettingsListCardItem key={idx}>
                        <SettingsListCardItemIcon icon={Briefcase} color="purple" />
                        <SettingsListCardItemLabel>{job}</SettingsListCardItemLabel>
                        <SettingsListCardItemActions>
                          <div className="flex -space-x-px">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() => handleEdit("job", job, idx)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("actions.edit")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() => handleDelete("job", job, idx)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("actions.delete")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </SettingsListCardItemActions>
                      </SettingsListCardItem>
                    ))}
                  </SettingsListCardItemList>
                  <SettingsListCardFooter>
                    <SettingsListCardAddButton onClick={() => handleAdd("job")}>
                      {t("settingsReferenceData.addPosition")}
                    </SettingsListCardAddButton>
                  </SettingsListCardFooter>
                </SettingsListCardContent>
              </SettingsListCard>

              <SettingsListCard>
                <SettingsListCardHeader>
                  <div className="flex items-center gap-2">
                    <SettingsListCardTitle>
                      {t("settingsReferenceData.contractTypes")}
                    </SettingsListCardTitle>
                    <SettingsListCardCount>
                      {contractTypes.length}
                    </SettingsListCardCount>
                  </div>
                  <SettingsListCardBadge color="orange">
                    Contrats
                  </SettingsListCardBadge>
                </SettingsListCardHeader>
                <SettingsListCardContent>
                  <SettingsListCardItemList>
                    {contractTypes.map((type, idx) => (
                      <SettingsListCardItem key={idx}>
                        <SettingsListCardItemIcon icon={FileText} color="orange" />
                        <SettingsListCardItemLabel>{type}</SettingsListCardItemLabel>
                        <SettingsListCardItemActions>
                          <div className="flex -space-x-px">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() => handleEdit("contract", type, idx)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("actions.edit")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() => handleDelete("contract", type, idx)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("actions.delete")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </SettingsListCardItemActions>
                      </SettingsListCardItem>
                    ))}
                  </SettingsListCardItemList>
                  <SettingsListCardFooter>
                    <SettingsListCardAddButton onClick={() => handleAdd("contract")}>
                      {t("settingsReferenceData.addContractType")}
                    </SettingsListCardAddButton>
                  </SettingsListCardFooter>
                </SettingsListCardContent>
              </SettingsListCard>
            </div>

            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={confirmDelete}
        title={getDeleteTitle()}
        description={getDeleteDescription()}
      />

      <AddItemDialog
        open={addDialog.open}
        onOpenChange={(open) => setAddDialog({ ...addDialog, open })}
        onAdd={confirmAdd}
        title={getAddDialogTitle()}
        description={getAddDialogDescription()}
        label={getAddDialogLabel()}
        placeholder={getAddDialogPlaceholder()}
      />

      <EditItemDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
        onUpdate={confirmEdit}
        title={getEditDialogTitle()}
        description={getEditDialogDescription()}
        label={getEditDialogLabel()}
        placeholder={getEditDialogPlaceholder()}
        initialValue={editDialog.value}
      />
    </TooltipProvider>
  );
}
