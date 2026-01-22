import React, { useEffect, useState } from 'react'

const ParallaxBackground: React.FC = () => {
    const [scrollY, setScrollY] = useState(0)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('mousemove', handleMouseMove, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Dark Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-500 via-dark-600 to-forest-900" />

            {/* Animated Mesh Pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #82e4d0 1px, transparent 1px),
                        linear-gradient(to bottom, #82e4d0 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) translateY(${scrollY * 0.1}px)`,
                    transition: 'transform 0.3s ease-out',
                }}
            />

            {/* Glowing Orbs with Mouse Tracking */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 animate-pulse-slow"
                style={{
                    top: '10%',
                    left: '5%',
                    background: 'radial-gradient(circle, #82e4d0 0%, transparent 70%)',
                    transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px) translateY(${scrollY * 0.5}px)`,
                    transition: 'transform 0.5s ease-out',
                }}
            />

            <div
                className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15 animate-pulse-slow"
                style={{
                    top: '20%',
                    right: '10%',
                    background: 'radial-gradient(circle, #248680 0%, transparent 70%)',
                    transform: `translate(-${mousePosition.x * 0.04}px, ${mousePosition.y * 0.04}px) translateY(${scrollY * 0.3}px)`,
                    transition: 'transform 0.5s ease-out',
                    animationDelay: '2s',
                }}
            />

            <div
                className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-10"
                style={{
                    bottom: '-20%',
                    left: '20%',
                    background: 'radial-gradient(circle, #1d5450 0%, transparent 70%)',
                    transform: `translate(${mousePosition.x * 0.05}px, -${mousePosition.y * 0.05}px) translateY(${scrollY * -0.2}px)`,
                    transition: 'transform 0.5s ease-out',
                }}
            />

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-aqua-500 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.2,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 10 + 10}s`,
                        }}
                    />
                ))}
            </div>

            {/* Radial Gradient Overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(130, 228, 208, 0.15) 0%, transparent 50%)`,
                    transition: 'background 0.3s ease-out',
                }}
            />
        </div>
    )
}

export default ParallaxBackground
