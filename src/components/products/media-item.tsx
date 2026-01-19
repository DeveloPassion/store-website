import { useState } from 'react'
import { FaExpand, FaPlay } from 'react-icons/fa'
import { MarkdownContent } from '@/components/ui/markdown-content'
import type { MediaItem } from '@/schemas/media.schema'

interface MediaItemProps {
    item: MediaItem
    showCaption?: boolean
    onMediaClick?: () => void
    priority?: boolean // For eager loading (above-the-fold)
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) return match[1]
    }

    return null
}

const MediaItem: React.FC<MediaItemProps> = ({
    item,
    showCaption = false,
    onMediaClick,
    priority = false
}) => {
    const [videoPlaying, setVideoPlaying] = useState(false)

    // For videos, get YouTube ID from youtubeId field or extract from URL
    const youtubeId = item.type === 'video' ? item.youtubeId || extractYouTubeId(item.url) : null
    const thumbnailUrl =
        item.type === 'video'
            ? item.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
            : null

    const handleVideoPlay = () => {
        if (item.type === 'video' && youtubeId) {
            setVideoPlaying(true)
        }
    }

    const handleMediaClick = () => {
        if (onMediaClick) {
            onMediaClick()
        }
    }

    return (
        <div className='flex flex-col gap-2'>
            {/* Media Container */}
            <div className='group relative aspect-video overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-2xl'>
                {item.type === 'image' ? (
                    <>
                        {/* Image */}
                        <img
                            src={item.url}
                            alt={item.altText}
                            className='h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105'
                            loading={priority ? 'eager' : 'lazy'}
                            onClick={handleMediaClick}
                            width={item.width ?? undefined}
                            height={item.height ?? undefined}
                        />

                        {/* Overlay on Hover */}
                        <div
                            className='absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                            onClick={handleMediaClick}
                        >
                            <div className='flex flex-col items-center gap-2 text-white'>
                                <FaExpand className='h-8 w-8' aria-hidden='true' />
                                <span className='text-sm font-medium'>Click to expand</span>
                            </div>
                        </div>
                    </>
                ) : item.type === 'video' && youtubeId ? (
                    <>
                        {videoPlaying ? (
                            /* YouTube Iframe */
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                                title={item.title}
                                allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                allowFullScreen
                                className='absolute inset-0 h-full w-full'
                            />
                        ) : (
                            <>
                                {/* Video Thumbnail */}
                                <img
                                    src={thumbnailUrl || ''}
                                    alt={item.altText}
                                    className='h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105'
                                    loading={priority ? 'eager' : 'lazy'}
                                    onClick={handleVideoPlay}
                                />

                                {/* Play Button Overlay */}
                                <div
                                    className='absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-all duration-300 group-hover:bg-black/50'
                                    onClick={handleVideoPlay}
                                >
                                    <div className='bg-secondary flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20'>
                                        <FaPlay
                                            className='ml-1 h-6 w-6 text-white sm:h-8 sm:w-8'
                                            aria-label={`Play ${item.title}`}
                                        />
                                    </div>
                                </div>

                                {/* Expand Button - Top Right */}
                                {onMediaClick && (
                                    <button
                                        className='absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/70'
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleMediaClick()
                                        }}
                                        aria-label={`Expand ${item.title}`}
                                    >
                                        <FaExpand className='h-4 w-4' aria-hidden='true' />
                                    </button>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    /* Fallback for invalid video */
                    <div className='bg-background/50 flex h-full w-full items-center justify-center'>
                        <p className='text-primary/50 text-sm'>Video unavailable</p>
                    </div>
                )}
            </div>

            {/* Caption */}
            {showCaption && item.caption && (
                <MarkdownContent
                    content={item.caption}
                    inline
                    className='text-primary/70 text-center text-sm italic'
                />
            )}
        </div>
    )
}

export default MediaItem
