"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
}

export default function ParticleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [hasClicked, setHasClicked] = useState(false)

  const handleClick = () => {
    setHasClicked(true)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Colors for particles
    const colors = [
      "#8B5CF6", // Purple
      "#06B6D4", // Teal
      "#EC4899", // Pink
      "#10B981", // Emerald
      "#F59E0B", // Amber
    ]

    // Background color - pure black
    const bgColor = "rgba(0, 0, 0, 0.05)"

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initialize particles
    const initParticles = () => {
      const particleCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000))
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.8 + 0.2,
        })
      }
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Mouse interaction - increased sensitivity
        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Increased detection radius from 100 to 180
        // Increased force multiplier from 0.3 to 0.6
        if (distance < 180) {
          const force = (180 - distance) / 180
          particle.vx += (dx / distance) * force * 0.6
          particle.vy += (dy / distance) * force * 0.6
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Reduced friction for more responsive movement
        particle.vx *= 0.97
        particle.vy *= 0.97

        // Boundary collision
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = particle.color
            ctx.globalAlpha = ((120 - distance) / 120) * 0.3
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    resizeCanvas()
    initParticles()
    animate()

    // Event listeners
    window.addEventListener("resize", () => {
      resizeCanvas()
      initParticles()
    })
    window.addEventListener("mousemove", handleMouseMove)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-pointer" onClick={handleClick} />

      {/* Optional overlay content */}
      {!hasClicked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent">
              Interactive Particles
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-md mx-auto">
              Move your mouse to interact with the particles and watch them dance
            </p>
            <p className="text-lg md:text-xl text-gray-300 max-w-md mx-auto">
              Click to get started
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
