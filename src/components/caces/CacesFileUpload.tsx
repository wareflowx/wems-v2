import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

interface CacesFileUploadProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
}

export function CacesFileUpload({ value, onChange, label }: CacesFileUploadProps) {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange?.(file.name)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
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

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload" className="text-sm font-medium">
        {label}
      </Label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6
          transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/50'}
        `}
      >
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {value ? (
              <span className="font-medium text-foreground">{value}</span>
            ) : (
              <>
                <span className="font-medium">{t('documents.selectFile')}</span>
                <span className="mx-1">or</span>
                <span className="underline">drag and drop</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
