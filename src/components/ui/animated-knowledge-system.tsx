/**
 * Animated hero text component with multiple visual effects:
 * - Gradient sweep animation
 * - Character-by-character stagger reveal
 * - Pulsing glow effect
 * - Shimmer overlay
 * - Full accessibility support with reduced motion preference
 */

// Fixed particle positions for consistent, deterministic animations
// position: Tailwind classes, x/y: animation travel distance (px)
const PARTICLE_POSITIONS = [
    { position: 'left-[5%] top-[20%]', x: 42, y: -75, delay: 0 },
    { position: 'left-[25%] top-[35%]', x: -18, y: -52, delay: 0.4 },
    { position: 'left-[45%] top-[15%]', x: 8, y: -93, delay: 0.8 },
    { position: 'left-[60%] top-[40%]', x: -35, y: -68, delay: 1.2 },
    { position: 'left-[75%] top-[25%]', x: 55, y: -45, delay: 1.6 },
    { position: 'left-[90%] top-[30%]', x: -8, y: -82, delay: 2.0 }
]

interface AnimatedKnowledgeSystemProps {
    text: string
}

const AnimatedKnowledgeSystem: React.FC<AnimatedKnowledgeSystemProps> = ({ text }) => {
    const chars = text.split('')

    return (
        <span className='relative inline' aria-label={text}>
            {/* Main animated text */}
            <span className='relative inline'>
                {chars.map((char, index) => (
                    <span
                        key={index}
                        className={`text-secondary animate-char-reveal relative inline [--animation-delay:${index * 0.05}s]`}
                    >
                        {char === ' ' ? ' ' : char}
                    </span>
                ))}

                {/* Animated gradient overlay */}
                <span className='animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent'>
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
                        className={`bg-secondary/60 animate-particle absolute h-1 w-1 rounded-full ${pos.position} [--animation-delay:${pos.delay}s] [--particle-x:${pos.x}px] [--particle-y:${pos.y}px]`}
                    />
                ))}
            </span>
        </span>
    )
}

export default AnimatedKnowledgeSystem
