import { Minus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { electron } from '@/electron/api'

interface TitleBarProps {
  title?: string
}

export function TitleBar({ title = 'WEMS' }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!electron.isElectron()) return

    // Check initial window state
    electron.window.isMaximized().then(setIsMaximized)

    // Listen for window state changes
    const checkMaximized = () => {
      electron.window.isMaximized().then(setIsMaximized)
    }

    // Check periodically (Electron doesn't expose a maximize event)
    const interval = setInterval(checkMaximized, 500)

    return () => clearInterval(interval)
  }, [])

  const handleMinimize = () => {
    if (electron.isElectron()) {
      electron.window.minimize()
    }
  }

  const handleMaximize = () => {
    if (electron.isElectron()) {
      if (isMaximized) {
        electron.window.unmaximize()
      } else {
        electron.window.maximize()
      }
    }
  }

  const handleClose = () => {
    if (electron.isElectron()) {
      electron.window.close()
    }
  }

  // Only show in Electron
  if (!electron.isElectron()) {
    return null
  }

  return (
    <div className="flex h-8 items-center justify-between bg-background border-b px-2 select-none drag-region">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{title}</span>
      </div>

      <div className="flex items-center no-drag">
        <button
          onClick={handleMinimize}
          className="p-1.5 hover:bg-muted rounded transition-colors"
          aria-label="Minimize"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleMaximize}
          className="p-1.5 hover:bg-muted rounded transition-colors"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          <Square className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
