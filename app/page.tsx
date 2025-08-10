import { GenerateForm } from "@/components/generate-form"
import { SampleCards } from "@/components/sample-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Tailor your resume & cover letter to any company in minutes.</h1>
        <p className="mt-3 text-muted-foreground">
          Paste a job link or company and role. We generate an ATS-friendly one-page resume and a 250–400 word cover
          letter aligned to their tone.
        </p>
      </section>

      <section className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Get tailored documents</CardTitle>
          </CardHeader>
          <CardContent>
            <GenerateForm />
            <p className="mt-3 text-xs text-muted-foreground">
              Privacy: We don&apos;t sell your data. You can delete your results anytime from your browser. Processing
              typically takes ~15–30s.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">See what you&apos;ll get</h2>
        <SampleCards />
      </section>
    </div>
  )
}
