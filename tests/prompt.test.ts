import { describe, it, expect } from "vitest"
import { buildUserPrompt, splitArtifacts } from "../lib/prompt"

describe("buildUserPrompt", () => {
  it("contains required sections and headings instruction", () => {
    const p = buildUserPrompt({
      company: "Acme",
      role: "PM",
      jobExtractOrNA: "N/A",
      candidateText: "Some text",
    })
    expect(p).toContain("Task: Generate two artifacts")
    expect(p).toContain("Output exactly two top-level headings")
  })
})

describe("splitArtifacts", () => {
  it("splits when both headings present", () => {
    const text = "## Tailored Resume\nA\n## Cover Letter\nB"
    const { resumeMd, coverLetterMd } = splitArtifacts(text)
    expect(resumeMd).toContain("Tailored Resume")
    expect(coverLetterMd).toContain("Cover Letter")
  })
})
