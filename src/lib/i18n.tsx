import type { PortfolioProject } from '../data/portfolio'

export type Locale = 'id' | 'en'

export const copy = {
  id: {
    navAbout: 'TENTANG', navSkills: 'KEAHLIAN', navProjects: 'PROYEK', navContact: 'HUBUNGI SAYA',
    heroTitle: <>Membangun<br /><em>aplikasi web</em><br />dan sistem digital.</>,
    heroDescription: 'Saya mengembangkan aplikasi web, API, dan integrasi AI—dari antarmuka hingga basis data—untuk kebutuhan produk dan sistem perusahaan.',
    projectsCta: 'LIHAT PROYEK', aboutCta: 'TENTANG SAYA', explore: 'JELAJAHI PORTOFOLIO',
    processLabel: 'PROSES KERJA', exploreScroll: 'GULIR UNTUK MELIHAT', processTitle: <>DARI KEBUTUHAN <em>MENJADI SOLUSI.</em></>,
    process: [
      { kicker: 'PAHAMI', title: <>Pahami<br />kebutuhannya.</>, description: 'Memulai dari kebutuhan pengguna dan alur kerja agar solusi yang dibangun menjawab masalah yang tepat.', keywords: 'ANALISIS / DESAIN SISTEM / UX' },
      { kicker: 'BANGUN', title: <>Rangkai<br />menjadi sistem.</>, description: 'Antarmuka, API, dan basis data diintegrasikan menjadi aplikasi yang mudah digunakan dan siap dikembangkan.', keywords: 'REACT / API / BASIS DATA' },
      { kicker: 'RILIS', title: <>Siapkan<br />untuk digunakan.</>, description: 'Pengujian dan deployment membantu membawa aplikasi dari tahap pengembangan menuju penggunaan nyata.', keywords: 'UJI / DEPLOY / PERBAIKI' },
    ],
    about: 'TENTANG SAYA', resume: 'LIHAT CV', skills: 'KEAHLIAN', projectKicker: 'PORTOFOLIO / PROYEK TERPILIH',
    projects: 'PROYEK', projectNote: 'Kumpulan aplikasi web, sistem perusahaan, dan proyek personal yang saya kerjakan. Visual editorial ditandai saat tangkapan layar produk belum tersedia.',
    editorial: 'Visual editorial', projectImage: 'Tampilan proyek', details: 'DETAIL PROYEK', repository: 'LIHAT REPOSITORI',
    contact: 'HUBUNGI SAYA', contactTitle: <>Mari bangun<br />solusi digital.</>, email: 'KIRIM EMAIL',
    formTitle: 'Kirim pesan', nameLabel: 'Nama', emailLabel: 'Email', messageLabel: 'Pesan', sendMessage: 'KIRIM PESAN', sending: 'MENGIRIM…',
    privacyNote: 'Nama, email, dan pesan hanya digunakan untuk menanggapi pertanyaan Anda.', sent: 'Pesan terkirim. Terima kasih sudah menghubungi saya.', sendError: 'Pesan belum terkirim. Silakan coba lagi atau kirim email langsung.',
    backTop: 'KEMBALI KE ATAS',
  },
  en: {
    navAbout: 'ABOUT', navSkills: 'SKILLS', navProjects: 'PROJECTS', navContact: 'CONTACT',
    heroTitle: <>Building<br /><em>web applications</em><br />and digital systems.</>,
    heroDescription: 'I build web applications, APIs, and AI integrations—from user interfaces to databases—for digital products and business systems.',
    projectsCta: 'VIEW PROJECTS', aboutCta: 'ABOUT ME', explore: 'EXPLORE THE PORTFOLIO',
    processLabel: 'HOW I WORK', exploreScroll: 'SCROLL TO EXPLORE', processTitle: <>FROM REAL NEEDS <em>TO WORKING SOLUTIONS.</em></>,
    process: [
      { kicker: 'UNDERSTAND', title: <>Start with<br />the problem.</>, description: 'I begin with user needs and existing workflows so the solution addresses the right problem.', keywords: 'DISCOVERY / SYSTEM DESIGN / UX' },
      { kicker: 'BUILD', title: <>Connect<br />the whole system.</>, description: 'Interfaces, APIs, and databases come together in applications designed to be useful and maintainable.', keywords: 'REACT / API / DATABASES' },
      { kicker: 'DELIVER', title: <>Make it<br />ready to use.</>, description: 'Testing and deployment help move an application from development into real-world use.', keywords: 'TEST / DEPLOY / ITERATE' },
    ],
    about: 'ABOUT ME', resume: 'VIEW RESUME', skills: 'SKILLS', projectKicker: 'PORTFOLIO / SELECTED PROJECTS',
    projects: 'PROJECTS', projectNote: 'A selection of web applications, business systems, and personal projects I have worked on. Editorial visuals are labeled when original product screenshots are unavailable.',
    editorial: 'Editorial visual', projectImage: 'Project preview', details: 'PROJECT DETAILS', repository: 'VIEW REPOSITORY',
    contact: 'GET IN TOUCH', contactTitle: <>Let’s build<br />useful software.</>, email: 'SEND AN EMAIL',
    formTitle: 'Send a message', nameLabel: 'Name', emailLabel: 'Email', messageLabel: 'Message', sendMessage: 'SEND MESSAGE', sending: 'SENDING…',
    privacyNote: 'Your name, email, and message are used only to respond to your inquiry.', sent: 'Message sent. Thanks for reaching out.', sendError: 'Your message could not be sent. Please try again or email me directly.',
    backTop: 'BACK TO TOP',
  },
} satisfies Record<Locale, Record<string, unknown>>

export const servicesEn = [
  { title: 'Frontend Development', description: 'Building responsive, accessible web interfaces with React, Next.js, and Tailwind CSS.' },
  { title: 'Backend and APIs', description: 'Developing application logic, REST APIs, and system integrations with Node.js, Express, and Python.' },
  { title: 'Databases and Data', description: 'Designing data models and connecting applications to PostgreSQL, MySQL, and SQL Server.' },
  { title: 'AI Integration', description: 'Integrating LLM APIs and Retrieval-Augmented Generation into practical application workflows.' },
  { title: 'Application Delivery', description: 'Using Git, CI/CD, Linux servers, and VPS deployments to ship applications.' },
]

export const projectDescriptionsEn: Record<string, string> = {
  acs: 'An enterprise AI assistant featuring retrieval-augmented generation, real-time LLM responses, analysis workspaces, semantic graphs, and document management.',
  'aksara-cakra': 'A responsive company website presenting services, portfolio work, company information, and contact options.',
  'rebuilt-durasi': 'A secure internal and external whistleblowing platform for submitting and managing reports.',
  idip: 'A data intelligence platform featuring single sign-on, content management, public service portals, and analytics dashboards.',
  tnde: 'An electronic correspondence system for administrative workflows, records, and internal communication.',
  'monitoring-expenses': 'A personal finance application for recording and visualizing day-to-day expenses.',
  'streaming-platform': 'A streaming platform interface concept focused on clear media discovery and responsive presentation.',
}

export function projectForLocale(project: PortfolioProject, locale: Locale): PortfolioProject {
  return locale === 'en' && projectDescriptionsEn[project.slug]
    ? { ...project, description: projectDescriptionsEn[project.slug] }
    : project
}
