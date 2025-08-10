import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SampleCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Resume Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Product leader with 8+ years shipping B2B SaaS. Led go-to-market for analytics platform used by 2,000+
            customers; improved activation by 23% and reduced churn by 4 pts via onboarding experiments.
          </p>
        </CardContent>
      </Card>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Impact Bullet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Drove roadmap alignment with sales and CS; launched pricing experiment that increased ACV by 18% while
            maintaining NPS 60+ across enterprise accounts.
          </p>
        </CardContent>
      </Card>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Cover Letter Excerpt</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            I&apos;m drawn to Acme&apos;s focus on privacy-first collaboration. In my last role, I partnered with
            security and legal to ship SOC 2 Type II within 6 months, enabling 14 enterprise deals and $3.1M in ARR.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
