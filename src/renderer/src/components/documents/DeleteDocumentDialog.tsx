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
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

interface Document {
  id: number
  name: string
  type: string
  employee: string
  uploadDate: string
  size: string
  category: string
}

interface DeleteDocumentDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
  document?: Document
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  onConfirm,
  document,
}: DeleteDocumentDialogProps) {
  const { t } = useTranslation()
  const [confirmationText, setConfirmationText] = useState<string>('')

  // Reset confirmation text when dialog opens/closes
  useEffect(() => {
    if (open) {
      setConfirmationText('')
    }
  }, [open])

  const handleSubmit = () => {
    // TODO: Implement backend logic
    console.log('Deleting document:', { id: document?.id })
    onConfirm?.()
    onOpenChange?.(false)
  }

  const isFormValid = document && confirmationText === document.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t('documents.deleteDocument')}
          </DialogTitle>
          <DialogDescription>
            {t('documents.deleteDocumentWarning')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  {t('documents.typeToDelete')}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {t('documents.typeToDeleteDescription')}
                </p>
              </div>
            </div>
          </div>

          {document && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {t('documents.documentToDelete')}:
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{document.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {document.type} • {document.employee} • {document.size}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              {t('documents.confirmDeletion')}
            </Label>
            <Input
              id="confirmation"
              placeholder={document?.name || ''}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t('documents.typeDocumentName')} <strong>{document?.name}</strong> {t('documents.toConfirm')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1"
          >
            {t('documents.deleteDocument')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
