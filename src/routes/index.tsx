import { createFileRoute } from '@tanstack/react-router'
import { Zap, Code, Smartphone, Rocket } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <div>test</div>
}
