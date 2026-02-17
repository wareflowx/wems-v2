import { useState } from 'react'
import { Upload, FileText, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface CacesFileUploadProps {
  value?: string
  onChange?: (file: string) => void
  label?: string
}

export function CacesFileUpload({ value, onChange, label }: CacesFileUploadProps) {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server here
      // For now, we'll just use the file name
      onChange?.(file.name)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      onChange?.(file.name)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = () => {
    onChange?.('')
  }

  const handleDownload = () => {
    // In a real app, you would trigger a download of the actual file
    console.log('Downloading file:', value)
    window.open(value, '_blank')
  }

  if (value) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value}</p>
            <p className="text-xs text-muted-foreground">Document CACES</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        <input
          type="file"
          id="caces-file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{t('caces.uploadDocument')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('caces.uploadDocumentDescription')}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-1">
            {t('caces.selectFile')}
          </Button>
        </div>
      </div>
    </div>
  )
}
