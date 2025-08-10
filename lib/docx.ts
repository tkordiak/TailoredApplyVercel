import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx"

// Minimalny parsing Markdown → akapity/nagłówki/listy wypunktowane.
function mdLines(md: string): string[] {
  return md.replace(/\r/g, "").split("\n")
}

function stripInline(md: string): string {
  return md
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$1") // [text](url) -> text
    .replace(/^>+\s?/gm, "") // quote
    .trim()
}

function paraFromLine(line: string): Paragraph {
  // Headings
  if (/^###\s+/.test(line)) {
    return new Paragraph({
      spacing: { after: 140 },
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun(stripInline(line.replace(/^###\s+/, "")))],
    })
  }
  if (/^##\s+/.test(line)) {
    return new Paragraph({
      spacing: { after: 160 },
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun(stripInline(line.replace(/^##\s+/, "")))],
    })
  }
  if (/^#\s+/.test(line)) {
    return new Paragraph({
      spacing: { after: 200 },
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun(stripInline(line.replace(/^#\s+/, "")))],
    })
  }

  // Bullets
  if (/^\s*[-*•]\s+/.test(line)) {
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 80 },
      children: [new TextRun(stripInline(line.replace(/^\s*[-*•]\s+/, "")))],
    })
  }

  // Ordered (prosty fallback jako zwykły paragraf)
  if (/^\s*\d+\.\s+/.test(line)) {
    return new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun(stripInline(line))],
    })
  }

  // Pusty wiersz = odstęp
  if (line.trim() === "") {
    return new Paragraph({ spacing: { after: 140 } })
  }

  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun(stripInline(line))],
  })
}

function buildSectionFromMarkdown(title: string, subtitle: string | undefined, md: string) {
  const children: Paragraph[] = []
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun(title)],
    }),
  )
  if (subtitle && subtitle.trim().length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: subtitle, color: "6B7280" })],
      }),
    )
  }
  for (const line of mdLines(md)) {
    children.push(paraFromLine(line))
  }
  return { children }
}

export async function buildDocxFromMarkdown(opts: {
  company?: string
  role?: string
  resumeMd: string
  coverLetterMd: string
}): Promise<Uint8Array> {
  const subtitle = [opts.company || "", opts.role || ""].filter(Boolean).join(" • ") || undefined

  const resumeSection = buildSectionFromMarkdown("Tailored Resume", subtitle, opts.resumeMd)
  const coverSection = buildSectionFromMarkdown("Cover Letter", subtitle, opts.coverLetterMd)

  const doc = new Document({
    sections: [resumeSection, coverSection],
  })

  const buffer = await Packer.toBuffer(doc)
  return buffer
}
