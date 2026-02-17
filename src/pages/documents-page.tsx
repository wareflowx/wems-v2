import { Link } from '@tanstack/react-router'
import { Search, Upload, File, Download, Trash2, Eye, FileIcon, FileSpreadsheet, FileImage, FileText as FileIcon2, Sparkles, FileText, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SearchX, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeaderCard } from '@/components/ui/page-header-card'
import { MetricsSection } from '@/components/ui/metrics-section'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DeleteDocumentDialog } from '@/components/documents/DeleteDocumentDialog'
import { AddDocumentDialog } from '@/components/documents/AddDocumentDialog'

export function DocumentsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [deletingDocument, setDeletingDocument] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const documents = [
    { id: 1, name: 'Contrat_CDID_Dupont.pdf', type: 'Contrat', employee: 'Jean Dupont', employeeId: 1, uploadDate: '2024-01-15', size: '2.4 MB', category: 'pdf' },
    { id: 2, name: 'CACES_1A_Certificat.pdf', type: 'CACES', employee: 'Marie Martin', employeeId: 2, uploadDate: '2023-11-20', size: '1.8 MB', category: 'pdf' },
    { id: 3, name: 'Visite_Medicale_Initial.pdf', type: 'Visite médicale', employee: 'Pierre Bernard', employeeId: 3, uploadDate: '2024-01-10', size: '945 KB', category: 'pdf' },
    { id: 4, name: 'Photo_Identification.jpg', type: 'Identification', employee: 'Sophie Petit', employeeId: 4, uploadDate: '2023-09-15', size: '2.1 MB', category: 'image' },
  ]

  // Get unique types, categories and employees
  const uniqueTypes = useMemo(() => {
    const types = new Set(documents.map(d => d.type))
    return Array.from(types)
  }, [documents])

  const uniqueCategories = useMemo(() => {
    const categories = new Set(documents.map(d => d.category))
    return Array.from(categories)
  }, [documents])

  const uniqueEmployees = useMemo(() => {
    const employees = new Set(documents.map(d => d.employee))
    return Array.from(employees)
  }, [documents])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        search === '' ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.employee.toLowerCase().includes(search.toLowerCase()) ||
        doc.type.toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'all' || doc.type === typeFilter
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
      const matchesEmployee = employeeFilter === 'all' || doc.employee === employeeFilter

      return matchesSearch && matchesType && matchesCategory && matchesEmployee
    })
  }, [documents, search, typeFilter, categoryFilter, employeeFilter])

  // Sort documents
  const sortedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a]
      let bValue: any = b[sortColumn as keyof typeof b]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredDocuments, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage)
  const paginatedDocuments = sortedDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [search, typeFilter, categoryFilter, employeeFilter])

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'Contrat': 'bg-blue-600',
      'CACES': 'bg-purple-600',
      'Visite médicale': 'bg-green-600',
      'Identification': 'bg-orange-600',
    }
    const dotColor = typeColors[type] || 'bg-gray-600'

    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {type}
      </span>
    )

    const tooltipKey = `documents.tooltip.type${type.replace(/\s+/g, '')}`

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{t(tooltipKey)}</p></TooltipContent>
      </Tooltip>
    )
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'pdf': 'bg-red-600/15 border border-red-600/25 text-red-700',
      'image': 'bg-blue-600/15 border border-blue-600/25 text-blue-700',
      'spreadsheet': 'bg-green-600/15 border border-green-600/25 text-green-700',
    }
    const colors = categoryColors[category] || 'bg-gray-600/15 border border-gray-600/25 text-gray-700'

    const badge = (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors}`}>
        {category.toUpperCase()}
      </span>
    )

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{t('documents.tooltip.fileType', { type: category.toUpperCase() })}</p></TooltipContent>
      </Tooltip>
    )
  }

  // KPIs
  const kpis = {
    totalDocuments: documents.length,
    pdfDocuments: documents.filter(d => d.category === 'pdf').length,
    imageDocuments: documents.filter(d => d.category === 'image').length,
    thisMonth: 2
  }

  const getFileIcon = (category: string) => {
    const iconConfig = {
      'pdf': { icon: <FileIcon2 className="h-4 w-4" />, bg: 'bg-red-600/15', border: 'border-red-600/25', text: 'text-red-700' },
      'spreadsheet': { icon: <FileSpreadsheet className="h-4 w-4" />, bg: 'bg-green-600/15', border: 'border-green-600/25', text: 'text-green-700' },
      'image': { icon: <FileImage className="h-4 w-4" />, bg: 'bg-blue-600/15', border: 'border-blue-600/25', text: 'text-blue-700' },
    }
    const config = iconConfig[category as keyof typeof iconConfig] || { icon: <FileIcon className="h-4 w-4" />, bg: 'bg-gray-600/15', border: 'border-gray-600/25', text: 'text-gray-700' }

    return (
      <div className={`p-2 rounded-lg border ${config.bg} ${config.border} ${config.text}`}>
        {config.icon}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t('documents.title')}
            description={t('documents.description')}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t('documents.name'),
                value: kpis.totalDocuments,
                description: t('documents.totalDocuments'),
                icon: <FileText className="h-4 w-4" />
              },
              {
                title: 'PDF',
                value: kpis.pdfDocuments,
                description: `${((kpis.pdfDocuments / kpis.totalDocuments) * 100).toFixed(0)}% du total`,
                icon: <FileIcon2 className="h-4 w-4" />,
                iconColor: 'text-red-500'
              },
              {
                title: 'Images',
                value: kpis.imageDocuments,
                description: `${((kpis.imageDocuments / kpis.totalDocuments) * 100).toFixed(0)}% du total`,
                icon: <FileImage className="h-4 w-4" />,
                iconColor: 'text-blue-500'
              },
              {
                title: t('documents.thisMonth'),
                value: kpis.thisMonth,
                description: t('documents.newDocuments'),
                icon: <Upload className="h-4 w-4" />,
                iconColor: 'text-green-500'
              }
            ]}
          />

          <div className="flex gap-2 flex-col">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('documents.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('documents.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('documents.allTypes')}</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('documents.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('documents.allCategories')}</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('caces.employee')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard.allEmployees')}</SelectItem>
                  {uniqueEmployees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="gap-2 ml-auto" onClick={() => setIsAddDialogOpen(true)}><Upload className="h-4 w-4" />{t('documents.addDocument')}</Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        {t('documents.name')}
                        {getSortIcon('name')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        {t('documents.type')}
                        {getSortIcon('type')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('employee')}
                    >
                      <div className="flex items-center gap-1">
                        {t('documents.employee')}
                        {getSortIcon('employee')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        {t('documents.category')}
                        {getSortIcon('category')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('uploadDate')}
                    >
                      <div className="flex items-center gap-1">
                        {t('documents.uploadDate')}
                        {getSortIcon('uploadDate')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('size')}
                    >
                      <div className="flex items-center gap-1">
                        {t('documents.size')}
                        {getSortIcon('size')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">{t('employees.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64">
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <SearchX className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium">{t('common.noData')}</p>
                        <p className="text-sm mt-2 max-w-md text-center">
                          {t('dashboard.noDataFound')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.category)}
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">{getTypeBadge(doc.type)}</TableCell>
                      <TableCell className="px-4">
                        <Link
                          to={`/employees/${doc.employeeId}`}
                          className="text-gray-700 underline hover:opacity-80 transition-opacity"
                        >
                          {doc.employee}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4">{getCategoryBadge(doc.category)}</TableCell>
                      <TableCell className="text-gray-700">{doc.uploadDate}</TableCell>
                      <TableCell className="text-gray-700">{doc.size}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingDocument(doc)}>
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
              <p className="text-sm text-muted-foreground">
                {t('documents.showing', {
                  from: ((currentPage - 1) * itemsPerPage) + 1,
                  to: Math.min(currentPage * itemsPerPage, sortedDocuments.length),
                  total: sortedDocuments.length
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AddDocumentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <DeleteDocumentDialog
        open={deletingDocument !== null}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
        document={deletingDocument}
      />
    </>
  )
}
