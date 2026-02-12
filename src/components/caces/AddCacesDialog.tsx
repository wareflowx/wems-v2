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
import { CacesFileUpload } from './CacesFileUpload'

interface AddCacesDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
}

export function AddCacesDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddCacesDialogProps) {
  const { t } = useTranslation()
  const [employee, setEmployee] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [issueDate, setIssueDate] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [document, setDocument] = useState<string>('')

  const handleSubmit = () => {
    // TODO: Implement backend logic
    console.log('Adding CACES:', { employee, category, issueDate, expiryDate, document })
    onConfirm?.()
    onOpenChange?.(false)
    // Reset form
    setEmployee('')
    setCategory('')
    setIssueDate('')
    setExpiryDate('')
    setDocument('')
  }

  const isFormValid = employee && category && issueDate && expiryDate

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployee('')
      setCategory('')
      setIssueDate('')
      setExpiryDate('')
      setDocument('')
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

  const categories = ['1A', '1B', '3', '5', '7']

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('caces.addCaces')}</DialogTitle>
          <DialogDescription>
            {t('caces.addCacesDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm font-medium">
              {t('caces.employee')}
            </Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder={t('caces.selectEmployee')} />
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
            <Label htmlFor="category" className="text-sm font-medium">
              {t('caces.category')}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t('caces.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    CACES {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="issueDate" className="text-sm font-medium">
                {t('caces.issueDate')}
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-sm font-medium">
                {t('caces.expiryDate')}
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <CacesFileUpload
            value={document}
            onChange={setDocument}
            label={t('caces.document')}
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
            {t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
