"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2 } from "lucide-react"
import { useSystem } from "@/components/system-context"

interface SpotifyProps {
  isDarkMode?: boolean
}

interface Track {
  title: string
  artist: string
  album: string
  file: string
  cover?: string
}

// Put MP3 files in the public folder and list them here
const playlist: Track[] = [
  {
    title: "Kun Faya Kun",
    artist: "A.R. Rahman, Javed Ali, Mohit Chauhan",
    album: "Rockstar",
    file: "/kun-faya-kun.mp3",
  },
  {
    title: "Lofi Study",
    artist: "FASSounds",
    album: "Lofi Beats",
    file: "/lofi-study-112191.mp3",
    cover: "/cozy-corner-beats.png",
  },
]

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return "0:00"
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export default function Spotify({ isDarkMode = true }: SpotifyProps) {
  const { volume: systemVolume } = useSystem()
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const track = playlist[trackIndex]

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"
  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const secondaryBg = isDarkMode ? "bg-gray-800" : "bg-gray-100"
  const hoverBg = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-500"

  // Play / pause, including after switching tracks
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, trackIndex])

  // Player volume is scaled by the system volume from Control Center
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume * (systemVolume / 100)
    }
  }, [volume, isMuted, systemVolume])

  const selectTrack = (index: number) => {
    setCurrentTime(0)
    setDuration(0)
    setTrackIndex((index + playlist.length) % playlist.length)
    setIsPlaying(true)
  }

  const handlePrevious = () => {
    // Like real players: restart the song unless we're right at the beginning
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    } else {
      selectTrack(trackIndex - 1)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const progress = (currentTime / (duration || 1)) * 100
  const effectiveVolume = isMuted ? 0 : volume

  const cover = (size: string, iconSize: string) =>
    track.cover ? (
      <img src={track.cover} alt="" className={`${size} object-cover`} />
    ) : (
      <div className={`${size} bg-gradient-to-br from-purple-800 to-blue-900 flex items-center justify-center`}>
        <Music2 className={`${iconSize} text-white/80`} />
      </div>
    )

  return (
    <div className={`h-full ${bgColor} ${textColor} flex flex-col`}>
      {/* Header */}
      <div className={`${secondaryBg} px-4 py-3 flex items-center gap-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <img src="/spotify.png" alt="" className="w-7 h-7" />
        <div className="min-w-0">
          <h2 className="font-semibold text-sm">Music Player</h2>
          <p className={`text-xs ${mutedText} truncate`}>
            {isPlaying ? "Now playing" : "Paused"} · {track.title}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Main Player */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <div className="w-40 h-40 sm:w-52 sm:h-52 mb-5 rounded-2xl overflow-hidden shadow-2xl">
            {cover("w-full h-full", "w-16 h-16")}
          </div>

          <div className="text-center mb-5 max-w-full">
            <h3 className="text-2xl font-bold mb-1 truncate">{track.title}</h3>
            <p className={`${mutedText} truncate`}>{track.artist}</p>
            <p className="text-xs text-gray-500 mt-0.5">{track.album}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleTimeChange}
              aria-label="Seek"
              className="spotify-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #1DB954 ${progress}%, #4D4D4D ${progress}%)` }}
            />
            <div className={`flex justify-between text-xs ${mutedText} mt-1 tabular-nums`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-5">
            <button className={`p-3 rounded-full ${hoverBg} transition-colors`} onClick={handlePrevious} aria-label="Previous">
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              className="p-4 bg-[#1DB954] hover:scale-105 active:scale-95 rounded-full transition-transform shadow-lg"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 text-black ml-0.5" />}
            </button>

            <button
              className={`p-3 rounded-full ${hoverBg} transition-colors`}
              onClick={() => selectTrack(trackIndex + 1)}
              aria-label="Next"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center w-full max-w-xs gap-3">
            <button className={`p-2 rounded-full ${hoverBg}`} onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted || effectiveVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effectiveVolume}
              onChange={handleVolumeChange}
              aria-label="Volume"
              className="spotify-slider flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #1DB954 ${effectiveVolume * 100}%, #4D4D4D ${effectiveVolume * 100}%)`,
              }}
            />
          </div>
          {systemVolume === 0 && <p className="text-xs text-yellow-500 mt-2">System sound is muted in Control Center.</p>}
        </div>

        {/* Playlist */}
        <div className="px-4 pb-4 max-w-md mx-auto">
          <h4 className={`text-xs font-semibold uppercase tracking-wide ${mutedText} mb-2 px-2`}>Up Next</h4>
          {playlist.map((item, index) => (
            <button
              key={item.file}
              onClick={() => (index === trackIndex ? setIsPlaying(!isPlaying) : selectTrack(index))}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left ${hoverBg} ${
                index === trackIndex ? "text-[#1DB954]" : ""
              }`}
            >
              <span className="w-5 text-center text-sm tabular-nums">
                {index === trackIndex && isPlaying ? "♪" : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className={`block truncate text-xs ${mutedText}`}>{item.artist}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={track.file}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => selectTrack(trackIndex + 1)}
      />

      <style jsx>{`
        .spotify-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }

        .spotify-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
