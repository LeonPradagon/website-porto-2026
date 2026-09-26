export type PortfolioProject = {
  slug: string
  title: string
  category: 'Professional' | 'Personal'
  description: string
  stack: string[]
  image: string
  href: string
  editorial: boolean
}

export const projects: PortfolioProject[] = [
  { slug: 'acs', title: 'ACS — Asisgo Core Sovereign', category: 'Professional', description: 'Asisten AI perusahaan dengan RAG, respons LLM real-time, ruang analisis, semantic graph, dan CMS dokumen.', stack: ['Next.js', 'Express', 'Python', 'PostgreSQL'], image: '/assets/projects/acs.jpg', href: 'https://github.com/LeonPradagon/acs', editorial: false },
  { slug: 'aksara-cakra', title: 'Aksara Cakra', category: 'Professional', description: 'Website profil perusahaan yang responsif untuk layanan, portofolio, informasi, dan kontak.', stack: ['Next.js', 'React', 'Express', 'Tailwind'], image: '/assets/projects/aksara.jpg', href: 'https://github.com/LeonPradagon/aksara', editorial: false },
  { slug: 'rebuilt-durasi', title: 'Rebuilt Durasi', category: 'Professional', description: 'Platform whistleblowing untuk laporan internal dan eksternal yang aman.', stack: ['Next.js', 'Express', 'Bootstrap', 'SQL Server'], image: '/assets/projects/rebuilt-durasi-cinematic.jpg', href: 'https://github.com/LeonPradagon/Rebuilt-Durasi', editorial: true },
  { slug: 'idip', title: 'IDIP', category: 'Professional', description: 'Platform intelijen data dengan SSO, CMS, portal layanan publik, dan dashboard analitik.', stack: ['React.js', 'Spring Boot', 'Tailwind', 'SQL Server'], image: '/assets/projects/idip-cinematic.jpg', href: 'https://github.com/LeonPradagon/IDIP', editorial: true },
  { slug: 'tnde', title: 'TNDE', category: 'Professional', description: 'Sistem naskah dinas elektronik untuk alur administrasi, arsip, dan korespondensi internal.', stack: ['Handlebars', 'Express', 'Tailwind CSS', 'PostgreSQL'], image: '/assets/projects/tnde-cinematic.jpg', href: 'https://github.com/LeonPradagon/TNDE', editorial: true },
  { slug: 'monitoring-expenses', title: 'Monitoring Expenses', category: 'Personal', description: 'Aplikasi untuk mencatat dan memvisualisasikan pengeluaran harian.', stack: ['TypeScript', 'Next.js', 'Tailwind'], image: '/assets/projects/monitoring-expenses.jpg', href: 'https://github.com/LeonPradagon/monitoring-expenses', editorial: false },
  { slug: 'streaming-platform', title: 'Streaming Platform', category: 'Personal', description: 'Eksplorasi antarmuka platform streaming dengan fokus pada penyajian media yang cepat.', stack: ['Next.js', 'Tailwind', 'Video.js'], image: '/assets/projects/netix.jpg', href: 'https://github.com/LeonPradagon/Streaming-platform', editorial: false },
]

export const services = [
  { title: 'Frontend Development', description: 'Antarmuka web responsif dan mudah dipakai dengan React, Next.js, dan Tailwind CSS.' },
  { title: 'Backend & API', description: 'Logika aplikasi, REST API, dan integrasi sistem menggunakan Node.js, Express, dan Python.' },
  { title: 'Data & Database', description: 'Model data dan kebutuhan aplikasi dengan PostgreSQL, MySQL, dan SQL Server.' },
  { title: 'AI Integration', description: 'Fitur berbasis LLM API dan Retrieval-Augmented Generation untuk alur kerja nyata.' },
  { title: 'Deployment & Delivery', description: 'Git, CI/CD, Linux server, dan deployment VPS untuk membawa produk ke produksi.' },
]

export const aboutText = 'Full-Stack Developer dengan pengalaman lebih dari dua tahun membangun aplikasi web dan solusi perusahaan. Saya bekerja dari antarmuka hingga backend, mengintegrasikan AI saat memberi manfaat nyata, dan saat ini berkontribusi pada inisiatif digital di PT Asia Sistem Indonesia.'
