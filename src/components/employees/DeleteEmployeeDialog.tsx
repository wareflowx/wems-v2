import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
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

interface DeleteEmployeeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
  employeeName?: string
  employeeId?: number
}

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  onConfirm,
  employeeName,
  employeeId,
}: DeleteEmployeeDialogProps) {
  const { t } = useTranslation()
  const [confirmationName, setConfirmationName] = useState('')

  const handleDelete = () => {
    // TODO: Implement backend logic
    console.log(`Deleting employee: ${employeeId} - ${employeeName}`)
    onConfirm?.()
    onOpenChange?.(false)
    setConfirmationName('')
  }

  const isConfirmed = confirmationName === employeeName

  // Reset confirmation when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationName('')
    }
    onOpenChange?.(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle>{t('employees.deleteEmployee')}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pl-[60px]">
            {t('employees.deleteEmployeeWarning')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmationName" className="text-sm font-medium">
              {t('employees.typeToDelete')}
            </Label>
            <Input
              id="confirmationName"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder={employeeName}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t('employees.typeToDeleteDescription')}
            </p>
          </div>
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
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed}
            className="flex-1"
          >
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
