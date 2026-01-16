/**
 * Animated hero text component with multiple visual effects:
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

interface AnimatedKnowledgeSystemProps {
    text: string
}

const AnimatedKnowledgeSystem: React.FC<AnimatedKnowledgeSystemProps> = ({ text }) => {
    const chars = text.split('')

    return (
        <span className='relative inline-block' aria-label={text}>
            {/* Main animated text */}
            <span className='relative inline-flex items-center'>
                {chars.map((char, index) => (
                    <span
                        key={index}
                        className={`text-secondary animate-char-reveal relative inline-block [--animation-delay:${index * 0.05}s]`}
                    >
                        {char === ' ' ? '\u00A0' : char}
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
                        className={`bg-secondary/60 animate-particle absolute h-1 w-1 rounded-full [--particle-left:${20 + i * 30}%] [--particle-top:${10 + i * 20}%] [--animation-delay:${i * 0.7}s] [animation-duration:${2 + i * 0.5}s] [--particle-x:${pos.x}px] [--particle-y:${pos.y}px]`}
                    />
                ))}
            </span>
        </span>
    )
}

export default AnimatedKnowledgeSystem
