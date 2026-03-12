"use client";

import * as React from "react";
import { Plus, Download, PanelRightClose, Loader2, FolderOpen, File, X, StickyNote } from "lucide-react";
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
import { AnimatedEmpty } from "@/components/ui/animated-empty";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  type NoteBadge,
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
  ];

  const dateRanges = [
    { id: "today", label: "Today" },
    { id: "7days", label: "Last 7 days" },
    { id: "30days", label: "Last 30 days" },
    { id: "all", label: "All time" },
  ];

  const COLORS = [
    { name: "Emerald", value: "emerald", className: "bg-emerald-500" },
    { name: "Amber", value: "amber", className: "bg-amber-500" },
    { name: "Indigo", value: "indigo", className: "bg-indigo-500" },
    { name: "Rose", value: "rose", className: "bg-rose-500" },
    { name: "Cyan", value: "cyan", className: "bg-cyan-500" },
    { name: "Violet", value: "violet", className: "bg-violet-500" },
    { name: "Blue", value: "blue", className: "bg-blue-500" },
    { name: "Green", value: "green", className: "bg-green-500" },
    { name: "Red", value: "red", className: "bg-red-500" },
    { name: "Orange", value: "orange", className: "bg-orange-500" },
  ];

  const getColorClass = (colorValue: string) => {
    return COLORS.find(c => c.value === colorValue)?.className || "bg-gray-500";
  };

  const getBadgeColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      green: "bg-green-500/10 border-green-500/20 text-green-500",
      yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
      orange: "bg-orange-500/10 border-orange-500/20 text-orange-500",
      red: "bg-red-500/10 border-red-500/20 text-red-500",
      teal: "bg-teal-500/10 border-teal-500/20 text-teal-500",
      gray: "bg-gray-500/10 border-gray-500/20 text-gray-500",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-500",
      cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
      violet: "bg-violet-500/10 border-violet-500/20 text-violet-500",
      indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500",
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      rose: "bg-rose-500/10 border-rose-500/20 text-rose-500",
    };
    return colorMap[color] || colorMap.gray;
  };

  // Badges state
  const [noteBadges, setNoteBadges] = React.useState<NoteBadge[]>([]);
  const [newBadgeName, setNewBadgeName] = React.useState("");
  const [newBadgeColor, setNewBadgeColor] = React.useState(COLORS[0].value);

  const addBadge = () => {
    if (!newBadgeName.trim() || noteBadges.length >= 5) return;
    if (noteBadges.some(b => b.name.toLowerCase() === newBadgeName.trim().toLowerCase())) return;
    setNoteBadges([...noteBadges, { name: newBadgeName.trim(), color: newBadgeColor }]);
    setNewBadgeName("");
  };

  const removeBadge = (index: number) => {
    setNoteBadges(noteBadges.filter((_, i) => i !== index));
  };

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
      badges: noteBadges,
    });
    setNewNoteTitle("");
    setNewNoteDescription("");
    setNoteBadges([]);
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
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">Create new</p>
                  <p className="text-xs text-muted-foreground">Select an entity type to create</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openDialog("create-employee")}>
                  <div className="flex flex-col">
                    <span className="text-sm">Employee</span>
                    <span className="text-xs text-muted-foreground">Add a new employee to the system</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog("create-document")}>
                  <div className="flex flex-col">
                    <span className="text-sm">Document</span>
                    <span className="text-xs text-muted-foreground">Upload a new document file</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog("create-caces")}>
                  <div className="flex flex-col">
                    <span className="text-sm">CACES</span>
                    <span className="text-xs text-muted-foreground">Register a new CACES certification</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-medical-visit")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Medical Visit</span>
                    <span className="text-xs text-muted-foreground">Schedule a medical examination</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-driving-authorization")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Driving Authorization</span>
                    <span className="text-xs text-muted-foreground">Add a driving permit</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-online-training")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Online Training</span>
                    <span className="text-xs text-muted-foreground">Register an e-learning course</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openDialog("create-contract")}>
                  <div className="flex flex-col">
                    <span className="text-sm">Contract</span>
                    <span className="text-xs text-muted-foreground">Create a new work contract</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog("create-position")}>
                  <div className="flex flex-col">
                    <span className="text-sm">Position</span>
                    <span className="text-xs text-muted-foreground">Define a job position</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-work-location")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Work Location</span>
                    <span className="text-xs text-muted-foreground">Add a workplace address</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-department")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Department</span>
                    <span className="text-xs text-muted-foreground">Create an organizational unit</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDialog("create-contract-type")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Contract Type</span>
                    <span className="text-xs text-muted-foreground">Define a contract category</span>
                  </div>
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
            <Calendar mode="single" className="rounded-md w-full border" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground px-4">Loading notes...</p>
            ) : notes.length === 0 ? (
              <AnimatedEmpty
                title="No notes yet"
                description="Create your first note to get started"
                icons={[StickyNote, StickyNote, StickyNote]}
                action={{
                  label: "Add Note",
                  onClick: () => setCreateNoteOpen(true),
                }}
                bordered={true}
                className="py-8 bg-background border rounded-lg"
              />
            ) : (
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
                  <NotesList
                    notes={notes}
                    onToggleComplete={(noteId, isCompleted) => {
                      updateNote.mutate({ id: noteId, isCompleted });
                    }}
                    onDeleteNote={(noteId) => {
                      deleteNote.mutate(noteId);
                    }}
                  />
                </CardContent>
                <CardFooter className="justify-center border-t pb-2">
                  <Link
                    to="/notes"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    See more
                  </Link>
                </CardFooter>
              </Card>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Dialog open={createNoteOpen} onOpenChange={(open) => {
        if (!open) {
          setNoteBadges([]);
          setNewBadgeName("");
        }
        setCreateNoteOpen(open);
      }}>
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

            {/* Badges Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Badges</label>
                <span className="text-xs text-muted-foreground">{noteBadges.length}/5</span>
              </div>

              {/* Existing badges */}
              {noteBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {noteBadges.map((badge, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeColorClass(badge.color)}`}
                    >
                      <span>{badge.name}</span>
                      <button
                        type="button"
                        onClick={() => removeBadge(index)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new badge */}
              {noteBadges.length < 5 && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={newBadgeName}
                      onChange={(e) => setNewBadgeName(e.target.value)}
                      placeholder="Badge name"
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && addBadge()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBadge}
                      disabled={!newBadgeName.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <Tooltip key={color.value}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={`h-8 w-8 rounded-md ${color.className} ${
                              newBadgeColor === color.value ? "ring-2 ring-gray-900 ring-offset-2" : ""
                            } transition-all hover:scale-110`}
                            onClick={() => setNewBadgeColor(color.value)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{color.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleCreateNote} disabled={!newNoteTitle.trim()}>Create</Button>
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
