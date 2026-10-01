# Your Projects

## Current Projects

### 1. Spotify Clone

- **Live:** https://spotify-clone-rho-swart.vercel.app/
- **GitHub:** https://github.com/mohamedarshad-code/spotify-clone
- **Tech:** React, Next.js, Tailwind CSS, TypeScript
- **Description:** Fully functional Spotify clone with music player

### 2. New Future Travels Website

- **Live:** https://new-future-travels-website.vercel.app/
- **GitHub:** https://github.com/mohamedarshad-code/new-future-travels-website
- **Tech:** MERN Stack (MongoDB, Express, React, Node.js)
- **Description:** Travel booking website with tour packages

### 3. Madras Coffee House

- **Live:** https://madrascoffehouse.vercel.app/
- **GitHub:** https://github.com/mohamedarshad-code/madrascoffehouse
- **Tech:** React, Next.js, Tailwind CSS, TypeScript
- **Description:** Premium coffee shop website with heritage light aesthetic

---

## How to Add More Projects

### Option 1: Edit the Projects File

Edit `data/projects.ts` and add new projects:

```typescript
{
  id: 4,
  title: "Your Project Name",
  description: "Project description here",
  technologies: ["React", "Node.js", "etc"],
  liveUrl: "https://your-project.vercel.app/",
  githubUrl: "https://github.com/mohamedarshad-code/your-project",
  image: "/your-project.png", // optional
  featured: true,
  category: "Web App",
}
```

### Option 2: Add Project Screenshots

1. Take a screenshot of your project
2. Save it in `public` folder as `project-name.png`
3. Set the `image` field in `data/projects.ts` (leave it out to get a generated gradient cover)

---

## Where Projects Are Displayed

Everything reads from `data/projects.ts`, so you only need to edit one file:

- **Safari app** - Project cards with live demo and code links
- **Spotlight** (Ctrl/⌘ + K) - Search projects by name or technology
- **Terminal** - `projects` command
- **Notes app** - "About Me" note

---

## Project Categories

- Web App
- Full Stack
- Mobile App
- UI/UX
- API/Backend
- Open Source

Add more categories in `data/projects.ts` as needed!
