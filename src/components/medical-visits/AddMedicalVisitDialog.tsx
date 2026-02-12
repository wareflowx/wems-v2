import { useState } from 'react'
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
import { Plus } from 'lucide-react'

interface AddMedicalVisitDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
}

export function AddMedicalVisitDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddMedicalVisitDialogProps) {
  const { t } = useTranslation()
  const [employee, setEmployee] = useState<string>('')
  const [type, setType] = useState<string>('')
  const [scheduledDate, setScheduledDate] = useState<string>('')

  const handleSubmit = () => {
    // TODO: Implement backend logic
    console.log('Adding medical visit:', { employee, type, scheduledDate })
    onConfirm?.()
    onOpenChange?.(false)
    // Reset form
    setEmployee('')
    setType('')
    setScheduledDate('')
  }

  const isFormValid = employee && type && scheduledDate

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployee('')
      setType('')
      setScheduledDate('')
    }
    onOpenChange?.(open)
  }

  const employees = [
    { id: 1, name: 'Jean Dupont' },
    { id: 2, name: 'Marie Martin' },
    { id: 3, name: 'Pierre Bernard' },
    { id: 4, name: 'Sophie Petit' },
    { id: 5, name: 'Luc Dubois' },
  ]

  const visitTypes = [
    { value: 'Visite périodique', label: t('medicalVisits.periodicVisit') },
    { value: 'Visite de reprise', label: t('medicalVisits.returnVisit') },
    { value: 'Visite initiale', label: t('medicalVisits.initialVisit') },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('medicalVisits.newVisit')}</DialogTitle>
          <DialogDescription>
            {t('medicalVisits.addVisitDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm font-medium">
              {t('medicalVisits.employee')}
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
              {t('medicalVisits.type')}
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder={t('medicalVisits.selectType')} />
              </SelectTrigger>
              <SelectContent>
                {visitTypes.map((visitType) => (
                  <SelectItem key={visitType.value} value={visitType.value}>
                    {visitType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate" className="text-sm font-medium">
              {t('medicalVisits.scheduledDate')}
            </Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full"
            />
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
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('medicalVisits.newVisit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
