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

export function SettingsReferencePage() {
  const { t } = useTranslation();
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

  const [departments, setDepartments] = useState([
    "Production",
    "Administration",
    "RH",
    "Commercial",
    "Maintenance",
  ]);
  const [jobTitles, setJobTitles] = useState([
    "Opérateur",
    "Technicien",
    "Comptable",
    "Responsable RH",
    "Commercial",
  ]);
  const [contractTypes, setContractTypes] = useState([
    "CDI",
    "CDD",
    "Intérim",
    "Alternance",
  ]);

  const handleDelete = (type: "department" | "job" | "contract", value: string, index: number) => {
    setDeleteDialog({ open: true, type, value, index });
  };

  const confirmDelete = () => {
    const { type, index } = deleteDialog;
    if (index >= 0) {
      switch (type) {
        case "department":
          setDepartments(departments.filter((_, i) => i !== index));
          break;
        case "job":
          setJobTitles(jobTitles.filter((_, i) => i !== index));
          break;
        case "contract":
          setContractTypes(contractTypes.filter((_, i) => i !== index));
          break;
      }
    }
    setDeleteDialog({ ...deleteDialog, open: false });
  };

  const handleAdd = (type: "department" | "job" | "contract") => {
    setAddDialog({ open: true, type });
  };

  const confirmAdd = (value: string) => {
    const { type } = addDialog;
    switch (type) {
      case "department":
        setDepartments([...departments, value]);
        break;
      case "job":
        setJobTitles([...jobTitles, value]);
        break;
      case "contract":
        setContractTypes([...contractTypes, value]);
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
    const { type, index } = editDialog;
    if (index >= 0) {
      switch (type) {
        case "department":
          setDepartments(departments.map((item, i) => (i === index ? newValue : item)));
          break;
        case "job":
          setJobTitles(jobTitles.map((item, i) => (i === index ? newValue : item)));
          break;
        case "contract":
          setContractTypes(contractTypes.map((item, i) => (i === index ? newValue : item)));
          break;
      }
    }
    setEditDialog({ ...editDialog, open: false });
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
