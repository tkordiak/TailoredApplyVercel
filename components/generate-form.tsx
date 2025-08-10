"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import type { z } from "zod"
import { GenerateRequestSchema } from "@/lib/schemas"
import { useRouter } from "next/navigation"

type FormValues = z.infer<typeof GenerateRequestSchema>

const LAST_KEY = "tailored-apply:last"
const HISTORY_KEY = "tailored-apply:history"

export function GenerateForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(GenerateRequestSchema),
    mode: "onChange",
    defaultValues: { company: "", role: "", jobUrl: "", extra: "" },
  })

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to generate")
      }
      const data = (await res.json()) as {
        resumeMd: string
        coverLetterMd: string
        tokensUsed?: number
        requestId?: string
      }
      const payload = {
        id: crypto.randomUUID(),
        company: values.company,
        role: values.role,
        jobUrl: values.jobUrl || undefined,
        extra: values.extra || undefined,
        resumeMd: data.resumeMd,
        coverLetterMd: data.coverLetterMd,
        tokensUsed: data.tokensUsed,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(LAST_KEY, JSON.stringify(payload))

      // Update history (last 5)
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        const arr = raw ? (JSON.parse(raw) as any[]) : []
        const next = [payload, ...arr].slice(0, 5)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }

      toast.success("Generated successfully")
      router.push("/result")
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong")
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Acme Corp" {...register("company")} />
          {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Job Title</Label>
          <Input id="role" placeholder="Senior Product Manager" {...register("role")} />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job URL (optional)</Label>
        <Input
          id="jobUrl"
          inputMode="url"
          placeholder="https://company.com/careers/roles/12345"
          {...register("jobUrl")}
        />
        {errors.jobUrl && <p className="text-xs text-destructive">{errors.jobUrl.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="extra">Extra Info (resume highlights, notes)</Label>
        <Textarea
          id="extra"
          placeholder="Paste relevant experience, achievements, technologies, etc."
          rows={6}
          {...register("extra")}
        />
        {errors.extra && <p className="text-xs text-destructive">{errors.extra.message}</p>}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Tip: Strong inputs yield strong outputs. Typical generation time ~15–30s.
        </p>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
