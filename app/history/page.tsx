"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type ResultPayload = {
  id: string
  company: string
  role: string
  jobUrl?: string
  extra?: string
  resumeMd: string
  coverLetterMd: string
  tokensUsed?: number
  createdAt: string
}

const HISTORY_KEY = "tailored-apply:history"

export default function HistoryPage() {
  const [history, setHistory] = useState<ResultPayload[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) {
      try {
        const arr = JSON.parse(raw) as ResultPayload[]
        setHistory(arr)
      } catch {
        setHistory([])
      }
    }
  }, [])

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
    toast.success("History cleared")
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">History</h1>
        <Button variant="outline" onClick={clearHistory}>
          Clear
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {history.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No history yet</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Generate your first tailored documents to see them here.
            </CardContent>
          </Card>
        ) : (
          history.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {item.role} {item.company ? `@ ${item.company}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()} • Tokens: {item.tokensUsed ?? "—"}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-muted-foreground">Preview</summary>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                    {item.resumeMd.slice(0, 500)}...
                  </pre>
                </details>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
