import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { CacesFileUpload } from '@/components/caces/CacesFileUpload'

interface AddDocumentDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddDocumentDialogProps) {
  const { t } = useTranslation()
  const [employee, setEmployee] = useState<string>('')
  const [type, setType] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [document, setDocument] = useState<string>('')

  const handleSubmit = () => {
    // TODO: Implement backend logic
    console.log('Adding document:', { employee, type, name, document })
    onConfirm?.()
    onOpenChange?.(false)
    // Reset form
    setEmployee('')
    setType('')
    setName('')
    setDocument('')
  }

  const isFormValid = employee && type && name && document

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployee('')
      setType('')
      setName('')
      setDocument('')
    }
    onOpenChange(open)
  }

  const employees = [
    { id: 1, name: 'Jean Dupont' },
    { id: 2, name: 'Marie Martin' },
    { id: 3, name: 'Pierre Bernard' },
    { id: 4, name: 'Sophie Petit' },
    { id: 5, name: 'Luc Dubois' },
  ]

  const documentTypes = [
    'Contrat',
    'CACES',
    'Visite médicale',
    'Identification',
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documents.addDocument')}</DialogTitle>
          <DialogDescription>
            {t('documents.addDocumentDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm font-medium">
              {t('documents.employee')}
            </Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder={t('documents.selectEmployee')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.name}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              {t('documents.type')}
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder={t('documents.selectType')} />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType} value={docType}>
                    {docType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t('documents.documentName')}
            </Label>
            <Input
              id="name"
              placeholder={t('documents.documentNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <CacesFileUpload
            value={document}
            onChange={setDocument}
            label={t('documents.document')}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('documents.addDocument')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
