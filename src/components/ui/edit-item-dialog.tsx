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
import { Save } from 'lucide-react'

interface EditItemDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUpdate?: (value: string) => void
  title?: string
  description?: string
  label?: string
  placeholder?: string
  initialValue?: string
}

export function EditItemDialog({
  open,
  onOpenChange,
  onUpdate,
  title = 'Modifier',
  description,
  label,
  placeholder,
  initialValue,
}: EditItemDialogProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(initialValue || '')
  }, [initialValue, open])

  const handleUpdate = () => {
    if (value.trim()) {
      onUpdate?.(value.trim())
      onOpenChange?.(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="edit-item">{label}</Label>
            <Input
              id="edit-item"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={!value.trim()}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
