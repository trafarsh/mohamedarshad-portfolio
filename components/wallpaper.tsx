interface WallpaperProps {
  isDarkMode: boolean
  onClick?: () => void
}

export default function Wallpaper({ isDarkMode, onClick }: WallpaperProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" onClick={onClick}>
      {/* Both wallpapers stay mounted so switching themes cross-fades instead of flashing */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: "url('/wallpaper-day.jpg')" }}
      />
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: "url('/wallpaper-night.jpg')" }}
      />

      {/* Subtle vignette for better readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%)"
            : "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />
    </div>
  )
}
