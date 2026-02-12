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
import { ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AddCacesDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  employeeId?: number
  employeeName?: string
}

const cacesCategories = [
  { value: '1A', label: 'Catégorie 1A - Engins de chantier' },
  { value: '1B', label: 'Catégorie 1B - Engins de levage' },
  { value: '2', label: 'Catégorie 2 - Plates-formes élévatrices' },
  { value: '3', label: 'Catégorie 3 - Chariots de manutention' },
  { value: '4', label: 'Catégorie 4 - Ponts roulants et portiques' },
  { value: '5', label: 'Catégorie 5 - Grues auxiliaires' },
  { value: '6', label: 'Catégorie 6 - Grues mobiles' },
  { value: '7', label: 'Catégorie 7 - Grues à tour' },
  { value: '8', label: 'Catégorie 8 - Ponts et grues mobiles' },
]

export function AddCacesDialog({ open, onOpenChange, onSuccess, employeeId, employeeName }: AddCacesDialogProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    category: '',
    issueDate: '',
    expiryDate: '',
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // TODO: Implement backend logic to save CACES
    console.log('Adding CACES:', {
      employeeId,
      ...formData
    })
    onSuccess?.()
    onOpenChange?.(false)
    // Reset form
    setFormData({
      category: '',
      issueDate: '',
      expiryDate: '',
    })
  }

  const isFormValid = () => {
    return formData.category && formData.issueDate && formData.expiryDate
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Ajouter un CACES
          </DialogTitle>
          <DialogDescription>
            {employeeName && `Pour ${employeeName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie de CACES *</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {cacesCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">Date d'obtention *</Label>
            <Input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => updateFormData('issueDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Date d'expiration *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => updateFormData('expiryDate', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!isFormValid()}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
