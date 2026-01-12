/**
 * Animated "Knowledge System" text component with multiple visual effects:
 * - Gradient sweep animation
 * - Character-by-character stagger reveal
 * - Pulsing glow effect
 * - Shimmer overlay
 * - Full accessibility support with reduced motion preference
 */

// Fixed particle positions for consistent, deterministic animations
const PARTICLE_POSITIONS = [
    { x: 42, y: -75 },
    { x: -18, y: -52 },
    { x: 8, y: -93 }
]

const AnimatedKnowledgeSystem: React.FC = () => {
    const text = 'Knowledge System'
    const chars = text.split('')

    return (
        <span className='relative inline-block' aria-label='Knowledge System'>
            {/* Main animated text */}
            <span className='relative inline-flex items-center'>
                {chars.map((char, index) => (
                    <span
                        key={index}
                        className='text-secondary animate-char-reveal relative inline-block'
                        style={{
                            animationDelay: `${index * 0.05}s`,
                            animationFillMode: 'both'
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}

                {/* Animated gradient overlay */}
                <span
                    className='animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent'
                    style={{
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {text}
                </span>
            </span>

            {/* Pulsing glow effect behind text */}
            <span
                className='text-secondary/30 animate-glow-pulse absolute inset-0 blur-xl'
                aria-hidden='true'
            >
                {text}
            </span>

            {/* Particle effects */}
            <span className='absolute inset-0 overflow-visible' aria-hidden='true'>
                {PARTICLE_POSITIONS.map((pos, i) => (
                    <span
                        key={i}
                        className='bg-secondary/60 animate-particle absolute h-1 w-1 rounded-full'
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${10 + i * 20}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${2 + i * 0.5}s`,
                            // Use CSS variables for random particle movement
                            ['--particle-x' as string]: `${pos.x}px`,
                            ['--particle-y' as string]: `${pos.y}px`
                        }}
                    />
                ))}
            </span>

            <style>{`
                @keyframes char-reveal {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) rotateX(-90deg);
                        filter: blur(10px);
                    }
                    50% {
                        opacity: 0.8;
                        transform: translateY(-5px) rotateX(10deg);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) rotateX(0);
                        filter: blur(0);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.05);
                    }
                }

                @keyframes particle {
                    0% {
                        opacity: 0;
                        transform: translate(0, 0) scale(0);
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translate(var(--particle-x, 50px), var(--particle-y, -50px)) scale(1.5);
                    }
                }

                .animate-char-reveal {
                    animation: char-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .animate-shimmer {
                    animation: shimmer 3s ease-in-out infinite;
                }

                .animate-glow-pulse {
                    animation: glow-pulse 2s ease-in-out infinite;
                }

                .animate-particle {
                    animation: particle 3s ease-out infinite;
                }

                /* Respect user's motion preferences for accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .animate-char-reveal,
                    .animate-shimmer,
                    .animate-glow-pulse,
                    .animate-particle {
                        animation: none;
                        opacity: 1;
                        transform: none;
                        filter: none;
                    }
                }
            `}</style>
        </span>
    )
}

export default AnimatedKnowledgeSystem
