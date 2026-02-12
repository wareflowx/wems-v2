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
import { Check, User, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CreateEmployeeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

const steps = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Review', icon: Check },
]

export function CreateEmployeeDialog({ open, onOpenChange, onSuccess }: CreateEmployeeDialogProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    // Professional Info
    department: '',
    position: '',
    contractType: '',
    startDate: '',
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // TODO: Implement backend logic
    console.log(formData)
    onSuccess?.()
    onOpenChange?.(false)
    // Reset form
    setCurrentStep(1)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      department: '',
      position: '',
      contractType: '',
      startDate: '',
    })
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email
      case 2:
        return formData.department && formData.position && formData.contractType && formData.startDate
      default:
        return true
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('employees.addEmployee')}</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 w-full">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center w-full">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 ${
                      currentStep > step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ml-2 ${
                      currentStep === step.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('employeeDetail.identity')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('employeeDetail.firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('employeeDetail.lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('employeeDetail.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('employeeDetail.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">{t('employeeDetail.dateOfBirth')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">{t('employeeDetail.address')}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Rue de la République, 75001 Paris"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('employeeDetail.jobAndContract')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">{t('employees.department')} *</Label>
                  <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder={t('employees.department')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">{t('employees.position')} *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => updateFormData('position', e.target.value)}
                    placeholder="Operator"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">{t('employeeDetail.contractType')} *</Label>
                  <Select value={formData.contractType} onValueChange={(value) => updateFormData('contractType', value)}>
                    <SelectTrigger id="contractType">
                      <SelectValue placeholder={t('employeeDetail.contractType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdi">CDI</SelectItem>
                      <SelectItem value="cdd">CDD</SelectItem>
                      <SelectItem value="alternance">Alternance</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t('employeeDetail.startDate')} *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('common.confirm')}</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Personal Info Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">{t('employeeDetail.identity')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.fullName')}:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.email')}:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.phone')}:</span>
                      <span className="font-medium">{formData.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.dateOfBirth')}:</span>
                      <span className="font-medium">{formData.dateOfBirth || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.address')}:</span>
                      <span className="font-medium">{formData.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Info Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">{t('employeeDetail.jobAndContract')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employees.department')}:</span>
                      <span className="font-medium capitalize">{formData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employees.position')}:</span>
                      <span className="font-medium">{formData.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.contractType')}:</span>
                      <span className="font-medium uppercase">{formData.contractType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employeeDetail.startDate')}:</span>
                      <span className="font-medium">{formData.startDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              {t('common.cancel')}
            </Button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  {t('common.previous')}
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button type="button" onClick={handleNext} disabled={!isStepValid()}>
                  {t('common.next')}
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>
                  {t('common.confirm')}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
