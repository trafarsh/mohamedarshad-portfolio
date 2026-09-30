"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, RotateCcw, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { readSetting, writeSetting } from "@/components/system-context"

interface SnakeProps {
  isDarkMode?: boolean
  isActive?: boolean
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

interface GameState {
  snake: Position[]
  food: Position
  score: number
  gameOver: boolean
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const BASE_SPEED = 130
const MIN_SPEED = 60
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
]

const OPPOSITE: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" }
const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP",
  s: "DOWN",
  a: "LEFT",
  d: "RIGHT",
}

// Picks a random empty cell (no recursion, so it can't blow the stack on a long snake)
function randomFood(snake: Position[]): Position {
  const free: Position[] = []
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y })
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 }
}

const newGame = (): GameState => ({ snake: INITIAL_SNAKE, food: { x: 5, y: 5 }, score: 0, gameOver: false })

export default function Snake({ isDarkMode = true, isActive = true }: SnakeProps) {
  const [game, setGame] = useState<GameState>(newGame)
  const [isPaused, setIsPaused] = useState(true)
  const [highScore, setHighScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Direction used for the last move, and the direction queued for the next one
  const currentDirection = useRef<Direction>("UP")
  const queuedDirection = useRef<Direction>("UP")
  const swipeStart = useRef<Position | null>(null)

  const speed = Math.max(MIN_SPEED, BASE_SPEED - Math.floor(game.score / 50) * 10)

  useEffect(() => {
    const saved = Number.parseInt(readSetting("snakeHighScore") ?? "", 10)
    if (!Number.isNaN(saved)) setHighScore(saved)
  }, [])

  useEffect(() => {
    if (game.score > highScore) {
      setHighScore(game.score)
      writeSetting("snakeHighScore", game.score.toString())
    }
  }, [game.score, highScore])

  // Pause automatically when the window loses focus or is minimized
  useEffect(() => {
    if (!isActive) setIsPaused(true)
  }, [isActive])

  const changeDirection = useCallback(
    (direction: Direction) => {
      if (game.gameOver) return
      // Compare with the direction actually moved last, so two quick key presses can't reverse the snake into itself
      if (direction !== OPPOSITE[currentDirection.current]) {
        queuedDirection.current = direction
      }
      setIsPaused(false)
    },
    [game.gameOver],
  )

  const resetGame = () => {
    currentDirection.current = "UP"
    queuedDirection.current = "UP"
    setGame({ ...newGame(), food: randomFood(INITIAL_SNAKE) })
    setIsPaused(true)
  }

  // Game loop
  useEffect(() => {
    if (isPaused || game.gameOver) return

    const interval = setInterval(() => {
      setGame((prev) => {
        if (prev.gameOver) return prev

        const direction = queuedDirection.current
        currentDirection.current = direction

        const head = { ...prev.snake[0] }
        if (direction === "UP") head.y -= 1
        if (direction === "DOWN") head.y += 1
        if (direction === "LEFT") head.x -= 1
        if (direction === "RIGHT") head.x += 1

        const ateFood = head.x === prev.food.x && head.y === prev.food.y
        // The tail moves out of the way this tick unless the snake is growing
        const body = ateFood ? prev.snake : prev.snake.slice(0, -1)

        const hitWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE
        const hitSelf = body.some((segment) => segment.x === head.x && segment.y === head.y)
        if (hitWall || hitSelf) return { ...prev, gameOver: true }

        const snake = [head, ...body]
        return {
          snake,
          food: ateFood ? randomFood(snake) : prev.food,
          score: ateFood ? prev.score + 10 : prev.score,
          gameOver: false,
        }
      })
    }, speed)

    return () => clearInterval(interval)
  }, [isPaused, game.gameOver, speed])

  // Keyboard controls — only while this window is focused and the user isn't typing somewhere
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("input, textarea, [contenteditable='true']")) return

      const direction = KEY_TO_DIRECTION[e.key.length === 1 ? e.key.toLowerCase() : e.key]
      if (direction) {
        e.preventDefault()
        changeDirection(direction)
      } else if (e.key === " ") {
        e.preventDefault()
        if (game.gameOver) resetGame()
        else setIsPaused((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isActive, changeDirection, game.gameOver])

  // Draw the board whenever the game or theme changes
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const bgColor = isDarkMode ? "#1a1a1a" : "#f0f0f0"
    const gridColor = isDarkMode ? "#242424" : "#e6e6e6"

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = gridColor
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if ((i + j) % 2 === 0) ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    game.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? (isDarkMode ? "#86efac" : "#16a34a") : isDarkMode ? "#4ade80" : "#22c55e"
      const x = segment.x * CELL_SIZE + 1
      const y = segment.y * CELL_SIZE + 1
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath()
        ctx.roundRect(x, y, CELL_SIZE - 2, CELL_SIZE - 2, 5)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, CELL_SIZE - 2, CELL_SIZE - 2)
      }
    })

    ctx.fillStyle = isDarkMode ? "#f87171" : "#ef4444"
    ctx.beginPath()
    ctx.arc(game.food.x * CELL_SIZE + CELL_SIZE / 2, game.food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, 2 * Math.PI)
    ctx.fill()

    const overlay = (title: string, subtitle: string) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.font = "bold 26px -apple-system, Arial"
      ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10)
      ctx.font = "15px -apple-system, Arial"
      ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20)
    }

    if (game.gameOver) overlay("Game Over", `Score ${game.score} — press Space or Restart`)
    else if (isPaused) overlay(game.score === 0 ? "Snake" : "Paused", "Press an arrow key or Play to start")
  }, [game, isPaused, isDarkMode])

  // Swipe controls for touch screens
  const handlePointerDown = (e: React.PointerEvent) => {
    swipeStart.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
      if (!game.gameOver) setIsPaused((prev) => !prev)
      return
    }
    if (Math.abs(dx) > Math.abs(dy)) changeDirection(dx > 0 ? "RIGHT" : "LEFT")
    else changeDirection(dy > 0 ? "DOWN" : "UP")
  }

  const dpadButton = (direction: Direction, Icon: typeof ChevronUp, className: string) => (
    <Button
      variant="outline"
      size="icon"
      className={`${className} ${isDarkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white" : ""}`}
      onClick={() => changeDirection(direction)}
      disabled={game.gameOver}
      aria-label={`Move ${direction.toLowerCase()}`}
    >
      <Icon className="w-5 h-5" />
    </Button>
  )

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"} p-4 overflow-auto`}>
      <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold">Score: {game.score}</span>
          <span className="flex items-center gap-1 text-yellow-500">
            <Trophy className="w-4 h-4" /> {highScore}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            disabled={game.gameOver}
            className={isDarkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white" : ""}
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? "Play" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            className={isDarkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white" : ""}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="w-full max-w-[400px] h-auto aspect-square border border-gray-600 rounded-md shadow-lg touch-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          aria-label="Snake game board"
        />
      </div>

      {/* On-screen controls */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 w-[132px] mx-auto">
        {dpadButton("UP", ChevronUp, "col-start-2")}
        {dpadButton("LEFT", ChevronLeft, "col-start-1 row-start-2")}
        {dpadButton("DOWN", ChevronDown, "col-start-2 row-start-2")}
        {dpadButton("RIGHT", ChevronRight, "col-start-3 row-start-2")}
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">Arrow keys / WASD to move · Space to pause · Swipe on touch screens</p>
    </div>
  )
}
