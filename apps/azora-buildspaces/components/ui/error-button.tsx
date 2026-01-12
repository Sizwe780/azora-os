"use client"

import { Button } from "@/components/ui/button"

export default function ErrorButton() {
  return (
    <Button
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
      onClick={() => {
        // Deliberately throw an error to test client-side Sentry capture
        throw new Error("This is your first error!")
      }}
    >
      Break the world
    </Button>
  )
}
