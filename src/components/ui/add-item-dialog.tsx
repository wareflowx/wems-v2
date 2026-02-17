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
import { Plus } from 'lucide-react'

interface AddItemDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onAdd?: (value: string) => void
  title?: string
  description?: string
  label?: string
  placeholder?: string
}

export function AddItemDialog({
  open,
  onOpenChange,
  onAdd,
  title = 'Ajouter',
  description,
  label,
  placeholder,
}: AddItemDialogProps) {
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (value.trim()) {
      onAdd?.(value.trim())
      setValue('')
      onOpenChange?.(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setValue('')
    }
    onOpenChange?.(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="new-item">{label}</Label>
            <Input
              id="new-item"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!value.trim()}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
