// Personal details used across the portfolio (apps, terminal, metadata, emails).
// Edit this file to customise the portfolio for yourself.

export const profile = {
  name: "Mohamed Arshad M",
  firstName: "Arshad",
  username: "arshad",
  role: "Full Stack & Flutter Developer",
  location: "Coimbatore, Tamil Nadu, India",
  email: "mohamedarshad1507@gmail.com",
  github: {
    username: "mohamedarshad-code",
    url: "https://github.com/mohamedarshad-code",
  },
  linkedin: {
    handle: "mohamed-arshad-3b8269380",
    url: "https://www.linkedin.com/in/mohamed-arshad-3b8269380/",
  },
  // Repository shown inside the VS Code app (opened through github1s.com)
  sourceRepo: "mohamedarshad-code/portfolio",
  bio: "I'm a passionate Full Stack & Flutter Developer based in Coimbatore, India. I specialize in building scalable web and mobile applications with modern technologies. With expertise in React, Next.js, Flutter, Firebase, and TypeScript, I deliver end-to-end solutions from concept to deployment.",
} as const

export const skills: Record<string, string[]> = {
  Frontend: [
    "React / Next.js",
    "Flutter / Dart",
    "TypeScript / JavaScript",
    "Tailwind CSS / Material Design",
    "UI/UX Design",
    "Responsive Web Development",
    "Progressive Web Apps (PWA)",
  ],
  Backend: [
    "Node.js / Express",
    "Firebase / Firestore",
    "Supabase",
    "RESTful APIs / GraphQL",
    "SQL (MySQL, PostgreSQL)",
    "NoSQL (MongoDB, Firebase)",
    "Serverless Architecture",
  ],
  "Mobile Development": [
    "Flutter (iOS & Android)",
    "Native Features Integration",
    "State Management (Provider, Riverpod, Bloc)",
    "Firebase Integration",
    "App Store & Play Store Deployment",
  ],
  "DevOps & Tools": [
    "Git / GitHub",
    "Docker",
    "CI/CD Pipelines",
    "Agile / Scrum Methodologies",
    "Cloud Services (Firebase, AWS)",
  ],
}
