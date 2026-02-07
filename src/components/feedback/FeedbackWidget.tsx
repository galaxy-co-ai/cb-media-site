'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

interface SelectedElement {
  selector: string
  text: string
  tagName: string
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const [selectedElementRef, setSelectedElementRef] = useState<HTMLElement | null>(null)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  // Generate a simple CSS selector for an element
  const getSelector = (el: HTMLElement): string => {
    if (el.id) return `#${el.id}`

    let selector = el.tagName.toLowerCase()
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c && !c.startsWith('feedback-'))
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.')
      }
    }

    return selector
  }

  // Get preview text from element
  const getPreviewText = (el: HTMLElement): string => {
    const text = el.textContent?.trim() || ''
    return text.length > 50 ? text.substring(0, 50) + '...' : text
  }

  // Handle element selection
  const handleElementClick = useCallback((e: MouseEvent) => {
    if (!isSelecting) return

    const target = e.target as HTMLElement

    // Ignore clicks on the feedback widget itself
    if (target.closest('[data-feedback-widget]')) return

    e.preventDefault()
    e.stopPropagation()

    setSelectedElement({
      selector: getSelector(target),
      text: getPreviewText(target),
      tagName: target.tagName.toLowerCase(),
    })
    setSelectedElementRef(target)
    setIsSelecting(false)
    setHoveredElement(null)
  }, [isSelecting])

  // Handle hover during selection
  const handleMouseOver = useCallback((e: MouseEvent) => {
    if (!isSelecting) return

    const target = e.target as HTMLElement
    if (target.closest('[data-feedback-widget]')) return

    setHoveredElement(target)
  }, [isSelecting])

  const handleMouseOut = useCallback(() => {
    if (!isSelecting) return
    setHoveredElement(null)
  }, [isSelecting])

  // Set up event listeners for element selection
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('click', handleElementClick, true)
      document.addEventListener('mouseover', handleMouseOver, true)
      document.addEventListener('mouseout', handleMouseOut, true)
      document.body.style.cursor = 'crosshair'
    } else {
      document.body.style.cursor = ''
    }

    return () => {
      document.removeEventListener('click', handleElementClick, true)
      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.body.style.cursor = ''
    }
  }, [isSelecting, handleElementClick, handleMouseOver, handleMouseOut])

  // Apply highlight to hovered element
  useEffect(() => {
    if (hoveredElement) {
      hoveredElement.style.outline = '2px solid #3b82f6'
      hoveredElement.style.outlineOffset = '2px'
    }

    return () => {
      if (hoveredElement) {
        hoveredElement.style.outline = ''
        hoveredElement.style.outlineOffset = ''
      }
    }
  }, [hoveredElement])

  // Capture screenshot with element highlighted
  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // Temporarily hide the feedback widget
      const widget = document.querySelector('[data-feedback-widget]') as HTMLElement
      if (widget) widget.style.display = 'none'

      // Add highlight to selected element
      if (selectedElementRef) {
        selectedElementRef.style.outline = '3px solid #ef4444'
        selectedElementRef.style.outlineOffset = '2px'
        selectedElementRef.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.3)'
      }

      // Capture the screenshot
      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        scale: 0.75, // Reduce size for email
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      })

      // Remove highlight
      if (selectedElementRef) {
        selectedElementRef.style.outline = ''
        selectedElementRef.style.outlineOffset = ''
        selectedElementRef.style.boxShadow = ''
      }

      // Show widget again
      if (widget) widget.style.display = ''

      // Convert to base64
      return canvas.toDataURL('image/jpeg', 0.7)
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!note.trim()) return

    setStatus('sending')

    try {
      // Capture screenshot if element was selected
      let screenshot: string | null = null
      if (selectedElement) {
        screenshot = await captureScreenshot()
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element: selectedElement,
          note: note.trim(),
          url: window.location.href,
          timestamp: new Date().toISOString(),
          screenshot,
        }),
      })

      if (response.ok) {
        setStatus('sent')
        setTimeout(() => {
          setIsOpen(false)
          setSelectedElement(null)
          setSelectedElementRef(null)
          setNote('')
          setStatus('idle')
        }, 2000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsSelecting(false)
    setSelectedElement(null)
    setSelectedElementRef(null)
    setNote('')
    setStatus('idle')
  }

  return (
    <div data-feedback-widget className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-80 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
              <span className="text-sm font-medium text-zinc-200">Feedback</span>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Element Selector */}
              <div>
                <label className="block text-xs text-zinc-400 mb-2">
                  Element (optional - includes screenshot)
                </label>
                {selectedElement ? (
                  <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded border border-zinc-600">
                    <span className="text-xs font-mono text-blue-400">{selectedElement.selector}</span>
                    <button
                      onClick={() => {
                        setSelectedElement(null)
                        setSelectedElementRef(null)
                      }}
                      className="ml-auto text-zinc-400 hover:text-zinc-200"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSelecting(!isSelecting)}
                    className={`w-full px-3 py-2 text-xs rounded border transition-colors ${
                      isSelecting
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {isSelecting ? '↑ Click any element on the page' : '+ Select element'}
                  </button>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs text-zinc-400 mb-2">
                  What needs to change?
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe the change needed..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:border-zinc-500"
                  rows={3}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!note.trim() || status === 'sending'}
                className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                  status === 'sent'
                    ? 'bg-green-500/20 text-green-400'
                    : status === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {status === 'sending' && 'Capturing & Sending...'}
                {status === 'sent' && '✓ Sent!'}
                {status === 'error' && 'Error - try again'}
                {status === 'idle' && 'Send Feedback'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg"
          >
            Feedback
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
