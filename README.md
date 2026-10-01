# 🍎 macOS Portfolio

A stunning, interactive macOS-inspired portfolio website built with Next.js and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)

![macOS portfolio desktop](public/macos-portfolio-demo.png)

## 👨‍💻 Portfolio

Full Stack & Flutter Developer Portfolio - Mohamed Arshad M

### ✨ Features

- 🖥️ Realistic macOS interface with dark/light mode (remembered between visits)
- 🪟 Real window management: drag, resize, minimize to the dock, maximize (or double-click the title bar), and focus ordering. Works with touch too
- 🔍 Spotlight search (<kbd>⌘/Ctrl</kbd> + <kbd>K</kbd>) across apps **and** projects
- 🗂️ Desktop shortcuts for About Me, Projects, Contact and Terminal
- 🧩 Apps that showcase skills and projects:
  - **Safari** – portfolio start page with project cards and links
  - **Notes** – bio, skills and services (create, edit and delete notes)
  - **Terminal** – `help`, `about`, `skills`, `projects`, `contact`, `open <app>`, `neofetch`… with history (↑/↓) and Tab completion
  - **Mail** – working contact form with auto-reply (Gmail + Nodemailer)
  - **GitHub** – live profile and repositories from the GitHub API
  - **VS Code** – browse this project's source code (github1s)
  - **Spotify** – music player with a playlist
  - **Weather** – live forecasts for any city (Open-Meteo, no API key needed)
  - **FaceTime** – camera with photo capture and download
  - **Snake** – keyboard, on-screen and swipe controls with a saved high score
  - **System Settings** & **About This Mac**
- 🎛️ Control Center with Wi-Fi, dark mode, fullscreen, brightness and volume (all kept in sync across the UI)
- 🔄 Boot, login, sleep, restart and shutdown sequences
- 📱 Responsive design for phones and tablets

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or higher
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mohamedarshad-code/portfolio.git
cd portfolio
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Configure the contact form — see [GMAIL_SETUP.md](GMAIL_SETUP.md):

```bash
# .env.local
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
# Optional: your domain, used for social-preview image URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser. Any password (or none) logs you in.

### Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the development server       |
| `npm run build`     | Create a production build          |
| `npm start`         | Serve the production build         |
| `npm run typecheck` | Type-check the project with `tsc`  |

## 🎨 Customization

### Personal Information

Most content comes from two files:

- `lib/profile.ts` – name, role, bio, email, GitHub/LinkedIn links and skills
- `data/projects.ts` – your projects (shown in Safari, Spotlight, Terminal and Notes) — see [PROJECTS.md](PROJECTS.md)

Other places you may want to edit:

- `components/apps/notes.tsx` – the "Services & Pricing" note
- `components/apps/terminal.tsx` – terminal commands
- `components/apps/spotify.tsx` – the music playlist — see [HOW_TO_ADD_SONG.md](HOW_TO_ADD_SONG.md)
- `lib/apps.ts` – which apps exist, their icons, and which appear in the dock

### Appearance

- Replace wallpapers in `public/wallpaper-day.jpg` and `public/wallpaper-night.jpg`
- Update app icons in the `public` folder
- Modify the color scheme in `tailwind.config.ts` and `app/globals.css`

## 📁 Project Structure

```
app/                  Next.js app router (page, layout, /api/send-email)
components/           Desktop shell: window manager, dock, menubar, overlays
components/apps/      One file per app
components/ui/        shadcn/ui primitives
data/projects.ts      Project list
lib/apps.ts           App registry and window sizing
lib/profile.ts        Personal details
public/               Icons, wallpapers, audio
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original macOS portfolio concept inspired by various open-source projects
- Icons from [Lucide React](https://lucide.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Weather data from [Open-Meteo](https://open-meteo.com/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

Mohamed Arshad M
- GitHub: [mohamedarshad-code](https://github.com/mohamedarshad-code)
- LinkedIn: [mohamed-arshad-3b8269380](https://www.linkedin.com/in/mohamed-arshad-3b8269380/)
- Location: Coimbatore, Tamil Nadu, India

---

<p align="center"><sub>Built with ❤️ by Mohamed Arshad M</sub></p>
