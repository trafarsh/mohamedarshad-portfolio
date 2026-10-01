// Your Portfolio Projects
// Add or edit projects here — they show up in Safari, Spotlight, Notes and the Terminal.

export interface Project {
  id: number
  title: string
  description: string
  technologies: string[]
  liveUrl: string
  githubUrl: string
  // Screenshot or logo in the public folder. Leave empty to show a generated cover.
  image?: string
  featured: boolean
  category: string
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Spotify Clone",
    description:
      "A fully functional Spotify clone with music player, playlists, and search functionality. Built with modern web technologies.",
    technologies: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    liveUrl: "https://spotify-clone-rho-swart.vercel.app/",
    githubUrl: "https://github.com/mohamedarshad-code/spotify-clone",
    featured: true,
    category: "Web App",
  },
  {
    id: 2,
    title: "New Future Travels Website",
    description:
      "A comprehensive travel booking website with tour packages, booking system, and user management. Full-stack MERN application.",
    technologies: ["MongoDB", "Express", "React", "Node.js", "Tailwind CSS"],
    liveUrl: "https://new-future-travels-website.vercel.app/",
    githubUrl: "https://github.com/mohamedarshad-code/new-future-travels-website",
    featured: true,
    category: "Full Stack",
  },
  {
    id: 3,
    title: "Madras Coffee House",
    description:
      "A premium coffee shop website featuring a heritage light aesthetic, detailed product menu, and organic design elements.",
    technologies: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    liveUrl: "https://madrascoffehouse.vercel.app/",
    githubUrl: "https://github.com/mohamedarshad-code/madrascoffehouse",
    image: "/madras-coffee-project.png",
    featured: true,
    category: "Web App",
  },
  // Add more projects here later
  // {
  //   id: 4,
  //   title: "Your Next Project",
  //   description: "Project description",
  //   technologies: ["Tech1", "Tech2"],
  //   liveUrl: "https://...",
  //   githubUrl: "https://github.com/...",
  //   image: "/project.png",
  //   featured: false,
  //   category: "Category",
  // },
]

export const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))]
