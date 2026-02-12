import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <p className="text-gray-600">Welcome to WEMS</p>
    </div>
  )
}
