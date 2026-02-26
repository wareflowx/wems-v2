import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Download,
  Edit,
  Eye,
  FileIcon,
  FileText as FileIcon2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Search,
  SearchX,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddDocumentDialog } from "@/components/documents/AddDocumentDialog";
import { DeleteDocumentDialog } from "@/components/documents/DeleteDocumentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricsSection } from "@/components/ui/metrics-section";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateDocument, useDeleteDocument, useDocuments } from "@/hooks";

export function DocumentsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deletingDocument, setDeletingDocument] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Use TanStack Query hook for documents
  const { data: documents = [], isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();

  const handleAddDocument = (data: {
    employeeId: number;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    filePath: string;
  }) => {
    createDocument.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      },
    });
  };

  // Get unique types, categories and employees
  const uniqueTypes = useMemo(() => {
    const types = new Set(documents.map((d) => d.type));
    return Array.from(types);
  }, [documents]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(documents.map((d) => d.category));
    return Array.from(categories);
  }, [documents]);

  const uniqueEmployees = useMemo(() => {
    const employees = new Set(documents.map((d) => d.employee));
    return Array.from(employees);
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        search === "" ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.employee.toLowerCase().includes(search.toLowerCase()) ||
        doc.type.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || doc.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;
      const matchesEmployee =
        employeeFilter === "all" || doc.employee === employeeFilter;

      return matchesSearch && matchesType && matchesCategory && matchesEmployee;
    });
  }, [documents, search, typeFilter, categoryFilter, employeeFilter]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments].sort((a, b) => {
      const aValue: any = a[sortColumn as keyof typeof a];
      const bValue: any = b[sortColumn as keyof typeof b];

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredDocuments, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);
  const paginatedDocuments = sortedDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      Contrat: "bg-blue-600",
      CACES: "bg-purple-600",
      "Visite médicale": "bg-green-600",
      Identification: "bg-orange-600",
    };
    const dotColor = typeColors[type] || "bg-gray-600";

    const badge = (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {type}
      </span>
    );

    const tooltipKey = `documents.tooltip.type${type.replace(/\s+/g, "")}`;

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{t(tooltipKey)}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      pdf: "bg-red-600/15 border border-red-600/25 text-red-700",
      image: "bg-blue-600/15 border border-blue-600/25 text-blue-700",
      spreadsheet: "bg-green-600/15 border border-green-600/25 text-green-700",
    };
    const colors =
      categoryColors[category] ||
      "bg-gray-600/15 border border-gray-600/25 text-gray-700";

    const badge = (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium text-xs ${colors}`}
      >
        {category.toUpperCase()}
      </span>
    );

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            {t("documents.tooltip.fileType", { type: category.toUpperCase() })}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  };

  // KPIs - calculated dynamically
  const kpis = useMemo(() => {
    const totalDocuments = documents.length;
    const pdfDocuments = documents.filter((d) => d.category === "pdf").length;
    const imageDocuments = documents.filter(
      (d) => d.category === "image"
    ).length;

    // Calculate documents uploaded this month
    const now = new Date();
    const thisMonth = documents.filter((d) => {
      const uploadDate = new Date(d.uploadDate);
      return (
        uploadDate.getMonth() === now.getMonth() &&
        uploadDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      totalDocuments,
      pdfDocuments,
      imageDocuments,
      thisMonth,
    };
  }, [documents]);

  const getFileIcon = (category: string) => {
    const iconConfig = {
      pdf: {
        icon: <FileIcon2 className="h-4 w-4" />,
        bg: "bg-red-600/15",
        border: "border-red-600/25",
        text: "text-red-700",
      },
      spreadsheet: {
        icon: <FileSpreadsheet className="h-4 w-4" />,
        bg: "bg-green-600/15",
        border: "border-green-600/25",
        text: "text-green-700",
      },
      image: {
        icon: <FileImage className="h-4 w-4" />,
        bg: "bg-blue-600/15",
        border: "border-blue-600/25",
        text: "text-blue-700",
      },
    };
    const config = iconConfig[category as keyof typeof iconConfig] || {
      icon: <FileIcon className="h-4 w-4" />,
      bg: "bg-gray-600/15",
      border: "border-gray-600/25",
      text: "text-gray-700",
    };

    return (
      <div
        className={`rounded-lg border p-2 ${config.bg} ${config.border} ${config.text}`}
      >
        {config.icon}
      </div>
    );
  };

  const handleDeleteDocument = (document: any) => {
    deleteDocument.mutate(document.id, {
      onSuccess: () => {
        setDeletingDocument(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            description={t("documents.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("documents.title")}
          />
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            description={t("documents.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("documents.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("documents.name"),
                value: kpis.totalDocuments,
                description: t("documents.totalDocuments"),
                icon: <FileText className="h-4 w-4" />,
              },
              {
                title: "PDF",
                value: kpis.pdfDocuments,
                description: `${((kpis.pdfDocuments / kpis.totalDocuments) * 100).toFixed(0)}% du total`,
                icon: <FileIcon2 className="h-4 w-4" />,
                iconColor: "text-red-500",
              },
              {
                title: "Images",
                value: kpis.imageDocuments,
                description: `${((kpis.imageDocuments / kpis.totalDocuments) * 100).toFixed(0)}% du total`,
                icon: <FileImage className="h-4 w-4" />,
                iconColor: "text-blue-500",
              },
              {
                title: t("documents.thisMonth"),
                value: kpis.thisMonth,
                description: t("documents.newDocuments"),
                icon: <Upload className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
            ]}
          />

          <div className="flex flex-col gap-2">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="bg-card pl-9"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("documents.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setTypeFilter} value={typeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("documents.type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("documents.allTypes")}</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setCategoryFilter} value={categoryFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("documents.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("documents.allCategories")}
                  </SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setEmployeeFilter} value={employeeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("caces.employee")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("dashboard.allEmployees")}
                  </SelectItem>
                  {uniqueEmployees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Upload className="h-4 w-4" />
                {t("documents.addDocument")}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("name")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("documents.name")}
                          {getSortIcon("name")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("type")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("documents.type")}
                          {getSortIcon("type")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("employee")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("documents.employee")}
                          {getSortIcon("employee")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("category")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("documents.category")}
                          {getSortIcon("category")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("uploadDate")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("documents.uploadDate")}
                          {getSortIcon("uploadDate")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("size")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("documents.size")}
                          {getSortIcon("size")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employees.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-64" colSpan={7}>
                        <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <SearchX className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="font-medium text-lg">
                            {t("common.noData")}
                          </p>
                          <p className="mt-2 max-w-md text-center text-sm">
                            {t("dashboard.noDataFound")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDocuments.map((doc) => (
                      <TableRow className="hover:bg-muted/50" key={doc.id}>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.category)}
                            <div>
                              <p className="font-medium text-gray-900">
                                {doc.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          {getTypeBadge(doc.type)}
                        </TableCell>
                        <TableCell className="px-4">
                          <Link
                            className="text-gray-700 underline transition-opacity hover:opacity-80"
                            to={`/employees/${doc.employeeId}`}
                          >
                            {doc.employee}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4">
                          {getCategoryBadge(doc.category)}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {doc.uploadDate}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {doc.size}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingDocument(doc)}
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {t("documents.showing", {
                  from: (currentPage - 1) * itemsPerPage + 1,
                  to: Math.min(
                    currentPage * itemsPerPage,
                    sortedDocuments.length
                  ),
                  total: sortedDocuments.length,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        className="h-8 w-8"
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        size="icon"
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AddDocumentDialog
        onAdd={handleAddDocument}
        onOpenChange={setIsAddDialogOpen}
        open={isAddDialogOpen}
      />
      <DeleteDocumentDialog
        document={deletingDocument}
        onConfirm={() =>
          deletingDocument && handleDeleteDocument(deletingDocument)
        }
        onOpenChange={(open) => !open && setDeletingDocument(null)}
        open={deletingDocument !== null}
      />
    </>
  );
}
