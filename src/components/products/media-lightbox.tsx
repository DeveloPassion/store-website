import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa'
import type { MediaItem } from '@/schemas/media.schema'
import { extractYouTubeId } from './media-item'

export interface MediaLightboxProps {
    mediaItems: MediaItem[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
    mediaItems,
    initialIndex = 0,
    isOpen,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    // Sync currentIndex when initialIndex changes (when opening for different images)
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
        }
    }, [isOpen, initialIndex])

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious()
        if (e.key === 'ArrowRight') goToNext()
        if (e.key === 'Escape') onClose()
    }

    if (!mediaItems || mediaItems.length === 0) return null

    const currentMedia = mediaItems[currentIndex]

    // For videos, get YouTube ID
    const youtubeId =
        currentMedia?.type === 'video'
            ? currentMedia.youtubeId || extractYouTubeId(currentMedia.url)
            : null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as='div' className='relative z-50' onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className='fixed inset-0 bg-black/95' />
                </Transition.Child>

                {/* Full-screen container */}
                <div className='fixed inset-0' onKeyDown={handleKeyDown}>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <Transition.Child
                            as={Fragment}
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'
                        >
                            <Dialog.Panel className='relative w-full max-w-7xl'>
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className='focus:ring-secondary absolute top-0 right-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:ring-2 focus:outline-none'
                                    aria-label='Close lightbox'
                                >
                                    <FaTimes className='h-6 w-6' aria-hidden='true' />
                                </button>

                                {/* Media Container */}
                                <div className='relative flex items-center justify-center'>
                                    {/* Previous Button */}
                                    {mediaItems.length > 1 && (
                                        <button
                                            onClick={goToPrevious}
                                            className='focus:ring-secondary absolute left-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:ring-2 focus:outline-none'
                                            aria-label='Previous media'
                                        >
                                            <FaChevronLeft className='h-6 w-6' aria-hidden='true' />
                                        </button>
                                    )}

                                    {/* Media with Animation - max-h accounts for title, counter, and thumbnails below */}
                                    <AnimatePresence mode='wait'>
                                        {currentMedia?.type === 'image' ? (
                                            <motion.img
                                                key={currentIndex}
                                                src={currentMedia.url}
                                                alt={currentMedia.altText}
                                                className='max-h-[60vh] w-auto rounded-lg shadow-2xl sm:max-h-[65vh]'
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        ) : currentMedia?.type === 'video' && youtubeId ? (
                                            <motion.div
                                                key={currentIndex}
                                                className='aspect-video max-h-[60vh] w-full max-w-5xl rounded-lg shadow-2xl sm:max-h-[65vh]'
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <iframe
                                                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                                    title={currentMedia.title}
                                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                                    allowFullScreen
                                                    className='h-full w-full rounded-lg'
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key={currentIndex}
                                                className='bg-background/50 flex items-center justify-center rounded-lg p-8'
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <p className='text-primary/50'>Media unavailable</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Next Button */}
                                    {mediaItems.length > 1 && (
                                        <button
                                            onClick={goToNext}
                                            className='focus:ring-secondary absolute right-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:ring-2 focus:outline-none'
                                            aria-label='Next media'
                                        >
                                            <FaChevronRight
                                                className='h-6 w-6'
                                                aria-hidden='true'
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Title and Counter */}
                                {currentMedia && (
                                    <div className='mt-4 text-center'>
                                        <h3 className='text-lg font-semibold text-white'>
                                            {currentMedia.title}
                                        </h3>
                                        {mediaItems.length > 1 && (
                                            <p className='mt-1 text-sm text-white/80'>
                                                {currentIndex + 1} / {mediaItems.length}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Thumbnail Navigation */}
                                {mediaItems.length > 1 && mediaItems.length <= 10 && (
                                    <div className='mt-6 flex justify-center gap-2'>
                                        {mediaItems.map((item, idx) => {
                                            const itemYoutubeId =
                                                item.type === 'video'
                                                    ? item.youtubeId || extractYouTubeId(item.url)
                                                    : null
                                            const thumbnailSrc =
                                                item.type === 'video' && itemYoutubeId
                                                    ? item.thumbnailUrl ||
                                                      `https://img.youtube.com/vi/${itemYoutubeId}/default.jpg`
                                                    : item.url

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`focus:ring-secondary relative h-16 w-16 overflow-hidden rounded border-2 transition-all focus:ring-2 focus:outline-none ${
                                                        idx === currentIndex
                                                            ? 'border-secondary scale-110'
                                                            : 'border-white/20 opacity-60 hover:opacity-100'
                                                    }`}
                                                    aria-label={`View ${item.title}`}
                                                >
                                                    <img
                                                        src={thumbnailSrc}
                                                        alt={`${item.title} thumbnail`}
                                                        className='h-full w-full object-cover'
                                                    />
                                                    {/* Play icon overlay for videos */}
                                                    {item.type === 'video' && (
                                                        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                                            <FaPlay
                                                                className='h-4 w-4 text-white'
                                                                aria-hidden='true'
                                                            />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default MediaLightbox
