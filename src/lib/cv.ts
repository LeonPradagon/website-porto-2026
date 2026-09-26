export type CvSection = 'experience' | 'education' | 'project' | 'skill' | 'certification'

export type CvEntry = {
  id: string
  section: CvSection
  title: string
  organization: string
  location: string
  start_date: string
  end_date: string
  details: string[]
  url: string
  sort_order: number
  visible: boolean
}

export type CvProfile = {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  linkedin_url: string
  github_url: string
  summary: string
  entries: CvEntry[]
}

export const cvSections: Array<{ id: CvSection; label: string; documentLabel: string }> = [
  { id: 'experience', label: 'Pengalaman Kerja', documentLabel: 'Experience' },
  { id: 'skill', label: 'Keahlian', documentLabel: 'Skills' },
  { id: 'education', label: 'Pendidikan', documentLabel: 'Education' },
  { id: 'project', label: 'Proyek', documentLabel: 'Projects' },
  { id: 'certification', label: 'Sertifikasi', documentLabel: 'Certifications' },
]

export const defaultCvProfile: CvProfile = {
  name: 'Jhansen Wilson',
  headline: 'Fullstack Developer',
  email: 'jhansen.wilson@gmail.com',
  phone: '085111322226',
  location: 'Jakarta, West Jakarta',
  linkedin_url: 'https://www.linkedin.com/in/jahnsen',
  github_url: '',
  summary: 'Full Stack Developer with 2+ years of experience building scalable web applications and enterprise solutions. Experienced in developing end-to-end systems using React, Next.js, Express.js, TypeScript, and PostgreSQL, with hands-on experience integrating AI-powered features using LLM APIs and Retrieval-Augmented Generation (RAG). Currently contributing to digital initiatives at PT Asia Sistem Indonesia, delivering reliable and high-impact products.',
  entries: [
    {
      id: 'exp-ab', section: 'experience', title: 'Frontend Developer', organization: 'PT Abhimata Persada',
      location: '', start_date: 'Feb 2024', end_date: 'Feb 2025',
      details: [
        'Developed Treasury Lite front-end using React.js, integrating dynamic data from MSSQL and building responsive UI components from Figma designs.',
        'Created wireframes and high-fidelity prototypes in Figma, delivering cross-device interfaces.',
        'Integrated REST APIs with backend services for dynamic UI updates and real-time data interaction.',
        'Improved responsiveness, fixed bugs, and refined user experience using QA feedback.',
      ], url: '', sort_order: 0, visible: true,
    },
    {
      id: 'exp-asi', section: 'experience', title: 'Fullstack Developer', organization: 'PT Asia Sistem Indonesia',
      location: '', start_date: 'May 2025', end_date: 'Present',
      details: [
        'Developed AI-powered applications using LLM APIs and Retrieval-Augmented Generation (RAG).',
        'Built semantic search systems with PostgreSQL and pgvector.',
        'Implemented document processing pipelines for text extraction, chunking, and embeddings.',
        'Developed full-stack applications using React, Next.js, Express.js, TypeScript, and PostgreSQL.',
        'Deployed and maintained environments with Docker, Redis, CI/CD, Elasticsearch, and Kibana.',
      ], url: '', sort_order: 1, visible: true,
    },
    {
      id: 'edu-binus', section: 'education', title: "Bachelor's degree in Computer Science", organization: 'Binus University',
      location: '', start_date: 'Sep 2021', end_date: 'Sep 2025', details: [], url: '', sort_order: 0, visible: true,
    },
    { id: 'skill-frontend', section: 'skill', title: 'Frontend', organization: '', location: '', start_date: '', end_date: '', details: ['React.js / Next.js', 'Responsive Web Design', 'Tailwind CSS'], url: '', sort_order: 0, visible: true },
    { id: 'skill-backend', section: 'skill', title: 'Backend', organization: '', location: '', start_date: '', end_date: '', details: ['Node.js / Express', 'REST API Development', 'Python'], url: '', sort_order: 1, visible: true },
    { id: 'skill-database', section: 'skill', title: 'Database', organization: '', location: '', start_date: '', end_date: '', details: ['PostgreSQL', 'MySQL', 'SQL Server'], url: '', sort_order: 2, visible: true },
    { id: 'skill-tools', section: 'skill', title: 'DevOps / Tools', organization: '', location: '', start_date: '', end_date: '', details: ['Git / GitHub', 'CI/CD (GitHub Actions, GitLab CI)', 'Linux Server', 'VPS Deployment'], url: '', sort_order: 3, visible: true },
  ],
}
