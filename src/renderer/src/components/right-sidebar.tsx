"use client";

import * as React from "react";
import { Plus, Download, PanelRightClose, Loader2, FolderOpen, File } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotesList } from "@/components/home/notes-list";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import { useDialogStore } from "@/stores/dialog-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/utils/toast";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Users,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
  FileText as FilePdf,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  previewExport,
  exportData,
  openExportedFile,
  openExportFolder,
  type ExportType,
  type ExportFormat,
  type ExportResult,
  type ExportPreview,
} from "@/actions/database";

interface RightSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onToggleRightSidebar?: () => void;
}

export function RightSidebar({
  onToggleRightSidebar,
  className,
  ...props
}: RightSidebarProps) {
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { toast } = useToast();
  const openDialog = useDialogStore((state) => state.openDialog);
  const [createNoteOpen, setCreateNoteOpen] = React.useState(false);
  const [newNoteTitle, setNewNoteTitle] = React.useState("");
  const [newNoteDescription, setNewNoteDescription] = React.useState("");

  // Export dialog state
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<ExportType[]>([]);
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = React.useState<ExportFormat>("all");
  const [isExporting, setIsExporting] = React.useState(false);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [exportResult, setExportResult] = React.useState<ExportResult | null>(null);
  const [exportPreview, setExportPreview] = React.useState<ExportPreview | null>(null);

  const exportTypes = [
    { id: "employees" as ExportType, label: "Employees", icon: Users },
    { id: "attachments" as ExportType, label: "Attachments", icon: FileText },
    { id: "media" as ExportType, label: "Media", icon: FileSpreadsheet },
  ];

  const formats = [
    { id: "csv" as ExportFormat, label: "CSV", icon: FileIcon },
    { id: "xlsx" as ExportFormat, label: "Excel", icon: FileSpreadsheet },
    { id: "pdf" as ExportFormat, label: "PDF", icon: FilePdf },
  ];

  const dateRanges = [
    { id: "today", label: "Today" },
    { id: "7days", label: "Last 7 days" },
    { id: "30days", label: "Last 30 days" },
    { id: "all", label: "All time" },
  ];

  // Fetch preview when types or dateRange changes
  React.useEffect(() => {
    if (selectedTypes.length === 0) {
      setExportPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsPreviewing(true);
      try {
        const preview = await previewExport(selectedTypes, dateRange as ExportFormat);
        setExportPreview(preview);
      } catch (e) {
        console.error("Preview error:", e);
        setExportPreview(null);
      } finally {
        setIsPreviewing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedTypes, dateRange]);

  const toggleType = (id: ExportType) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0 || !exportPreview || exportPreview.total === 0) {
      toast({
        title: "No data",
        description: "Select at least one type with data to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportResult(null);

    try {
      // Simulate progress for now
      for (let i = 0; i <= 50; i += 10) {
        setExportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const result = await exportData({
        types: selectedTypes,
        format: selectedFormat,
        dateRange: dateRange as ExportFormat,
      });

      setExportProgress(100);

      if (result.canceled) {
        setExportResult(null);
        setExportOpen(false);
        return;
      }

      setExportResult(result);

      if (!result.success) {
        toast({
          title: "Export failed",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleOpenFile = async () => {
    if (exportResult?.filePath) {
      await openExportedFile(exportResult.filePath);
    }
  };

  const handleOpenFolder = async () => {
    if (exportResult?.filePath) {
      await openExportFolder(exportResult.filePath);
    }
  };

  const handleCloseExport = () => {
    setExportOpen(false);
    setExportResult(null);
    setSelectedTypes([]);
    setSelectedFormat("csv");
    setDateRange("all");
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;
    createNote.mutate({
      title: newNoteTitle,
      description: newNoteDescription,
    });
    setNewNoteTitle("");
    setNewNoteDescription("");
    setCreateNoteOpen(false);
  };

  return (
    <Sidebar
      collapsible="none"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-l"
      {...props}
    >
      <SidebarHeader className="border-b px-2 py-2 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => openDialog("create-employee")}>
                  <span className="text-sm">Employee</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog("create-document")}>
                  <span className="text-sm">Document</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog("create-caces")}>
                  <span className="text-sm">CACES</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-medical-visit")}
                >
                  <span className="text-sm">Medical Visit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-driving-authorization")}
                >
                  <span className="text-sm">Driving Authorization</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-online-training")}
                >
                  <span className="text-sm">Online Training</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openDialog("create-contract")}>
                  <span className="text-sm">Contract</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog("create-position")}>
                  <span className="text-sm">Position</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-work-location")}
                >
                  <span className="text-sm">Work Location</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-department")}
                >
                  <span className="text-sm">Department</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-contract-type")}
                >
                  <span className="text-sm">Contract Type</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-7"
              onClick={() => setExportOpen(true)}
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupContent>
            <Calendar mode="single" className="rounded-md w-full" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Notes</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 text-muted-foreground"
                    onClick={() => setCreateNoteOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground px-4">Loading notes...</p>
                ) : (
                  <NotesList
                    notes={notes}
                    onToggleComplete={(noteId, isCompleted) => {
                      updateNote.mutate({ id: noteId, isCompleted });
                    }}
                    onDeleteNote={(noteId) => {
                      deleteNote.mutate(noteId);
                    }}
                  />
                )}
              </CardContent>
              <CardFooter className="justify-center border-t pb-2">
                <Link
                  to="/notes"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  See more
                </Link>
              </CardFooter>
            </Card>{" "}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Dialog open={createNoteOpen} onOpenChange={setCreateNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={newNoteDescription}
                onChange={(e) => setNewNoteDescription(e.target.value)}
                placeholder="Note description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleCreateNote}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={(open) => {
        if (!open) handleCloseExport();
      }}>
        <DialogContent className="sm:max-w-md">
          {!exportResult ? (
            // Export form
            <>
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Data to export</label>
                  <div className="flex flex-col gap-1">
                    {exportTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-2 hover:bg-muted/50"
                        onClick={() => toggleType(type.id)}
                      >
                        <Checkbox
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={() => toggleType(type.id)}
                        />
                        <type.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Format</label>
                  <div className="flex gap-2">
                    {formats.map((format) => (
                      <button
                        key={format.id}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-sm transition-colors ${
                          selectedFormat === format.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <format.icon className="h-4 w-4" />
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Date range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map((range) => (
                        <SelectItem key={range.id} value={range.id}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTypes.length > 0 && !isExporting && (
                  <div className="rounded-md border border-border bg-muted/50 p-3">
                    {isPreviewing ? (
                      <p className="text-sm text-muted-foreground">
                        Calculating...
                      </p>
                    ) : exportPreview ? (
                      exportPreview.total > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Ready to export{" "}
                          <span className="font-medium text-foreground">
                            {exportPreview.total}
                          </span>{" "}
                          record
                          {exportPreview.total !== 1 ? "s" : ""} in{" "}
                          {selectedFormat.toUpperCase()} format
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No data to export
                        </p>
                      )
                    ) : null}
                  </div>
                )}

                {isExporting && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Exporting...</span>
                      <span className="font-medium">{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseExport}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  disabled={selectedTypes.length === 0 || isExporting || !exportPreview || exportPreview.total === 0}
                  onClick={handleExport}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export
                </Button>
              </DialogFooter>
            </>
          ) : exportResult.success ? (
            // Success - show file location
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-lg font-semibold">Export Complete</h3>
                <p className="text-sm text-muted-foreground">
                  {exportResult.recordCount} records exported
                </p>
              </div>

              <div className="rounded-md bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">File saved to:</p>
                <p className="text-sm font-mono break-all">{exportResult.filePath}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleOpenFile} className="flex-1">
                  <FileIcon className="mr-2 h-4 w-4" />
                  Open File
                </Button>
                <Button variant="outline" onClick={handleOpenFolder} className="flex-1">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open Folder
                </Button>
              </div>

              <Button onClick={handleCloseExport} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            // Error
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-semibold">Export Failed</h3>
                <p className="text-sm text-muted-foreground">{exportResult.error}</p>
              </div>
              <Button onClick={handleCloseExport} className="w-full">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
