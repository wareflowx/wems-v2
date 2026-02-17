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

interface MedicalVisit {
  id: number
  employee: string
  type: string
  scheduledDate: string
  status: string
  daysUntil?: number
  actualDate?: string
  fitnessStatus?: string
}

interface DeleteMedicalVisitDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
  visit?: MedicalVisit
}

export function DeleteMedicalVisitDialog({
  open,
  onOpenChange,
  onConfirm,
  visit,
}: DeleteMedicalVisitDialogProps) {
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
    console.log('Deleting medical visit:', { id: visit?.id })
    onConfirm?.()
    onOpenChange?.(false)
  }

  const isFormValid = visit && confirmationText === visit.employee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t('medicalVisits.deleteVisit')}
          </DialogTitle>
          <DialogDescription>
            {t('medicalVisits.deleteVisitWarning')}
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
                  {t('medicalVisits.typeToDeleteDescription')}
                </p>
              </div>
            </div>
          </div>

          {visit && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {t('medicalVisits.visitToDelete')}:
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{visit.employee}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {visit.type} • {visit.scheduledDate}
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
              placeholder={visit?.employee || ''}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t('documents.typeDocumentName')} <strong>{visit?.employee}</strong> {t('documents.toConfirm')}
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
            {t('medicalVisits.deleteVisit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
