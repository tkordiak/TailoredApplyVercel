import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

// Very minimal Markdown -> text formatter
function mdToPlainText(md: string): string[] {
  const lines = md
    .replace(/\r/g, "")
    .replace(/^## +/gm, "") // strip top-level headings markers
    .replace(/^# +/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
    .split("\n")
  return lines
}

function drawWrappedText(
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  fontSize: number,
  maxWidth: number,
  lineGap = 4,
): number {
  const words = text.split(/\s+/)
  let line = ""
  let ty = y
  for (const w of words) {
    const lineTest = line ? `${line} ${w}` : w
    const width = font.widthOfTextAtSize(lineTest, fontSize)
    if (width > maxWidth && line) {
      page.drawText(line, { x, y: ty, size: fontSize, font, color: rgb(0, 0, 0) })
      ty -= fontSize + lineGap
      line = w
    } else {
      line = lineTest
    }
  }
  if (line) {
    page.drawText(line, { x, y: ty, size: fontSize, font, color: rgb(0, 0, 0) })
    ty -= fontSize + lineGap
  }
  return ty
}

export async function buildPdfFromMarkdown(resumeMd: string, coverLetterMd: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  // Page 1: Resume
  {
    const page = pdf.addPage([595.28, 841.89]) // A4 portrait
    const margin = 50
    let y = 800
    page.drawText("Tailored Resume", { x: margin, y, size: 18, font })
    y -= 26
    const lines = mdToPlainText(resumeMd)
    for (const line of lines) {
      if (y < 80) break // stop if page overflows
      y = drawWrappedText(page, line, margin, y, font, 11, page.getWidth() - margin * 2)
    }
  }

  // Page 2: Cover Letter
  {
    const page = pdf.addPage([595.28, 841.89])
    const margin = 50
    let y = 800
    page.drawText("Cover Letter", { x: margin, y, size: 18, font })
    y -= 26
    const lines = mdToPlainText(coverLetterMd)
    for (const line of lines) {
      if (y < 80) break
      y = drawWrappedText(page, line, margin, y, font, 11, page.getWidth() - margin * 2)
    }
  }

  const bytes = await pdf.save()
  return bytes
}
