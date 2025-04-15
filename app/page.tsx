"use client"
import PentrisGame from "@/components/pentris-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-white">Pentris</h1>
      <PentrisGame />
    </main>
  )
}
