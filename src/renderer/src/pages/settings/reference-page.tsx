import {
  Briefcase,
  Building,
  Edit,
  FileText,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddItemDialog } from "@/components/ui/add-item-dialog";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { EditItemDialog } from "@/components/ui/edit-item-dialog";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import {
  SettingsListCard,
  SettingsListCardAddButton,
  SettingsListCardBadge,
  SettingsListCardContent,
  SettingsListCardCount,
  SettingsListCardFooter,
  SettingsListCardHeader,
  SettingsListCardItem,
  SettingsListCardItemActions,
  SettingsListCardItemIcon,
  SettingsListCardItemLabel,
  SettingsListCardItemList,
  SettingsListCardTitle,
} from "@/components/ui/settings-list-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAddContractType,
  useAddDepartment,
  useAddJobTitle,
  useContractTypes,
  useDeleteContractType,
  useDeleteDepartment,
  useDeleteJobTitle,
  useDepartments,
  useJobTitles,
  useUpdateContractType,
  useUpdateDepartment,
  useUpdateJobTitle,
} from "@/hooks";

export function SettingsReferencePage() {
  const { t } = useTranslation();

  const { data: departments = [], isLoading: isLoadingDepartments } =
    useDepartments();
  const { data: jobTitles = [], isLoading: isLoadingJobs } = useJobTitles();
  const { data: contractTypes = [], isLoading: isLoadingContracts } =
    useContractTypes();

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

  const handleDelete = (
    type: "department" | "job" | "contract",
    value: string,
    index: number
  ) => {
    setDeleteDialog({ open: true, type, value, index });
  };

  const confirmDelete = () => {
    const { type, value } = deleteDialog;

    switch (type) {
      case "department":
        deleteDepartment.mutate(value, {
          onSuccess: () => {
            setDeleteDialog({ ...deleteDialog, open: false });
          },
        });
        break;
      case "job":
        deleteJobTitle.mutate(value, {
          onSuccess: () => {
            setDeleteDialog({ ...deleteDialog, open: false });
          },
        });
        break;
      case "contract":
        deleteContractType.mutate(value, {
          onSuccess: () => {
            setDeleteDialog({ ...deleteDialog, open: false });
          },
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
          },
        });
        break;
      case "job":
        addJobTitle.mutate(value, {
          onSuccess: () => {
            setAddDialog({ ...addDialog, open: false });
          },
        });
        break;
      case "contract":
        addContractType.mutate(value, {
          onSuccess: () => {
            setAddDialog({ ...addDialog, open: false });
          },
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

  const handleEdit = (
    type: "department" | "job" | "contract",
    value: string,
    index: number
  ) => {
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
            },
          }
        );
        break;
      case "job":
        updateJobTitle.mutate(
          { oldTitle: oldValue, newTitle: newValue },
          {
            onSuccess: () => {
              setEditDialog({ ...editDialog, open: false });
            },
          }
        );
        break;
      case "contract":
        updateContractType.mutate(
          { oldType: oldValue, newType: newValue },
          {
            onSuccess: () => {
              setEditDialog({ ...editDialog, open: false });
            },
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
    return t("settingsReferenceData.deleteWarning", {
      value: deleteDialog.value,
    });
  };

  if (isLoadingDepartments || isLoadingJobs || isLoadingContracts) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            description={t("settingsReferenceData.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("settingsReferenceData.title")}
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
            description={t("settingsReferenceData.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("settingsReferenceData.title")}
          />

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                        <SettingsListCardItemIcon
                          color="blue"
                          icon={Building}
                        />
                        <SettingsListCardItemLabel>
                          {dept}
                        </SettingsListCardItemLabel>
                        <SettingsListCardItemActions>
                          <div className="flex -space-x-px">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() =>
                                    handleEdit("department", dept, idx)
                                  }
                                  size="icon"
                                  variant="ghost"
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
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() =>
                                    handleDelete("department", dept, idx)
                                  }
                                  size="icon"
                                  variant="ghost"
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
                    <SettingsListCardAddButton
                      onClick={() => handleAdd("department")}
                    >
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
                        <SettingsListCardItemIcon
                          color="purple"
                          icon={Briefcase}
                        />
                        <SettingsListCardItemLabel>
                          {job}
                        </SettingsListCardItemLabel>
                        <SettingsListCardItemActions>
                          <div className="flex -space-x-px">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() => handleEdit("job", job, idx)}
                                  size="icon"
                                  variant="ghost"
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
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() => handleDelete("job", job, idx)}
                                  size="icon"
                                  variant="ghost"
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
                        <SettingsListCardItemIcon
                          color="orange"
                          icon={FileText}
                        />
                        <SettingsListCardItemLabel>
                          {type}
                        </SettingsListCardItemLabel>
                        <SettingsListCardItemActions>
                          <div className="flex -space-x-px">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() =>
                                    handleEdit("contract", type, idx)
                                  }
                                  size="icon"
                                  variant="ghost"
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
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() =>
                                    handleDelete("contract", type, idx)
                                  }
                                  size="icon"
                                  variant="ghost"
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
                    <SettingsListCardAddButton
                      onClick={() => handleAdd("contract")}
                    >
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
        description={getDeleteDescription()}
        onConfirm={confirmDelete}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        open={deleteDialog.open}
        title={getDeleteTitle()}
      />

      <AddItemDialog
        description={getAddDialogDescription()}
        label={getAddDialogLabel()}
        onAdd={confirmAdd}
        onOpenChange={(open) => setAddDialog({ ...addDialog, open })}
        open={addDialog.open}
        placeholder={getAddDialogPlaceholder()}
        title={getAddDialogTitle()}
      />

      <EditItemDialog
        description={getEditDialogDescription()}
        initialValue={editDialog.value}
        label={getEditDialogLabel()}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
        onUpdate={confirmEdit}
        open={editDialog.open}
        placeholder={getEditDialogPlaceholder()}
        title={getEditDialogTitle()}
      />
    </TooltipProvider>
  );
}
