"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Download, Copy, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"

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

const LAST_KEY = "tailored-apply:last"

export default function ResultPage() {
  const [result, setResult] = useState<ResultPayload | null>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LAST_KEY) : null
    if (raw) {
      try {
        setResult(JSON.parse(raw))
      } catch {
        setResult(null)
      }
    }
  }, [])

  const hasResult = !!result

  async function copyAll() {
    if (!result) return
    const text = `## Tailored Resume\n\n${result.resumeMd}\n\n## Cover Letter\n\n${result.coverLetterMd}`
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  async function downloadPdf() {
    if (!result) return
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeMd: result.resumeMd,
          coverLetterMd: result.coverLetterMd,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to export PDF")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Tailored-Apply_${result.role || "role"}_${result.company || "company"}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("Download started")
    } catch (e: any) {
      toast.error(e?.message || "Export failed")
    }
  }

  async function downloadDocx() {
    if (!result) return
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeMd: result.resumeMd,
          coverLetterMd: result.coverLetterMd,
          company: result.company,
          role: result.role,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to export DOCX")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Tailored-Apply_${result.role || "role"}_${result.company || "company"}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("DOCX download started")
    } catch (e: any) {
      toast.error(e?.message || "DOCX export failed")
    }
  }

  if (!hasResult) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>No results found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There are no generated documents in your browser yet. Please create one on the home page.
            </p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Results for {result?.role} {result?.company ? `@ ${result.company}` : ""}
          </h1>
          <p className="text-xs text-muted-foreground">
            Tokens used: {result?.tokensUsed ?? "—"} • Generated at {new Date(result!.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={copyAll}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={downloadPdf}>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={downloadDocx}>
            <Download className="mr-2 h-4 w-4" />
            Download .docx
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList>
          <TabsTrigger value="resume">Tailored Resume</TabsTrigger>
          <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
        </TabsList>
        <TabsContent value="resume" className="mt-4">
          <Card>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-6">
              <ReactMarkdown>{result?.resumeMd || ""}</ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coverLetter" className="mt-4">
          <Card>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-6">
              <ReactMarkdown>{result?.coverLetterMd || ""}</ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
