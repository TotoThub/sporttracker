import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Panel — full height minus top safe area */}
      <div className="relative w-full max-w-lg bg-[#0c1222] rounded-t-[28px] animate-slide-up flex flex-col"
           style={{ maxHeight: 'calc(100dvh - 40px)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header — fixed */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Content — scrollable, with extra bottom padding to clear nav bar */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
      </div>
    </div>
  )
}
