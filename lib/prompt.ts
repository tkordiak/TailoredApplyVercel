type PromptInput = {
  company: string
  role: string
  jobExtractOrNA: string
  candidateText: string
}

export function buildUserPrompt(input: PromptInput): string {
  const company = input.company || "N/A"
  const role = input.role || "N/A"
  const jobText = input.jobExtractOrNA || "N/A"
  const candidate = input.candidateText || "N/A"

  return [
    "You are an expert career coach and resume writer specializing in tailoring resumes and cover letters to specific job postings.",
    "",
    "Your task is to create a highly customized, ATS-friendly, and achievement-driven resume and a 250–400 word cover letter for the given job posting and company.",
    "",
    "INPUTS:",
    `- Candidate’s base resume (free text from the user):\n${candidate}`,
    `- Job posting text (extracted from URL or provided):\n${jobText}`,
    `- Company name: ${company}`,
    `- Target Role / Position: ${role}`,
    "- Tone: Pick based on the company's public style and culture (Professional / Formal / Startup-friendly).",
    "- File format: Markdown",
    "",
    "GOALS:",
    "1. Analyze the job posting and company description to extract the most important keywords, technical skills, and soft skills that recruiters will scan for.",
    "2. Rewrite the resume so that:",
    "   - It uses keywords from the job posting naturally.",
    "   - Bullet points are achievement-driven and quantified (include metrics like % improvements, time saved, revenue increased, bugs reduced).",
    "   - The language matches the tone of the company (formal for corporations, energetic for startups).",
    "   - Irrelevant details are removed.",
    '3. Add a "Key Achievements" or "Highlights" section at the top with 3–4 powerful bullet points that immediately sell the candidate.',
    "4. Ensure the resume passes Applicant Tracking Systems (ATS) by using clear headings: Summary, Key Achievements, Skills, Experience, Education, Certifications, Projects.",
    "5. Format the output in Markdown so it is visually appealing when displayed in the app.",
    "6. Generate a 250–400 word cover letter:",
    "   - Personalized to the hiring manager or team if known (otherwise address the hiring team).",
    "   - Reference the company’s mission, values, or products (use specifics from the job extract where possible).",
    "   - Show genuine interest and connection.",
    "   - Close with a clear CTA for next steps.",
    "7. Keep the length of the resume to 1–2 pages max.",
    "",
    "CONSTRAINTS:",
    "- Never invent employers, titles, dates, or certifications that are not present in the candidate input.",
    "- Use concise, quantifiable bullets (1–2 lines each).",
    "- Include 5–12 relevant keywords from the job/company (avoid stuffing).",
    "- Use a neutral, professional tone tailored to the target company's public style.",
    "",
    "OUTPUT FORMAT:",
    "- Output exactly two top-level headings in this order:",
    `## Tailored Resume for ${company} – ${role}`,
    "Include sections in this order: Summary, Key Achievements (3–4 bullets), Skills, Experience, Education, Certifications, Projects.",
    "",
    "## Cover Letter",
    "Provide a 250–400 word cover letter aligned to the company's tone and referencing 1–2 specific facts from the job/company context.",
  ].join("\n")
}

export function splitArtifacts(text: string): { resumeMd: string; coverLetterMd: string } {
  // Expect exactly two top-level headings
  const resumeIdx = text.indexOf("## Tailored Resume")
  const coverIdx = text.indexOf("## Cover Letter")
  if (resumeIdx === -1 || coverIdx === -1) {
    // fallback: try to split roughly halfway
    const mid = Math.floor(text.length / 2)
    return {
      resumeMd: text.slice(0, mid).trim(),
      coverLetterMd: text.slice(mid).trim(),
    }
  }
  const resumeMd = text.slice(resumeIdx, coverIdx).trim()
  const coverLetterMd = text.slice(coverIdx).trim()
  return { resumeMd, coverLetterMd }
}
