"use client"

import { useState, useEffect } from "react"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SendingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SendingModal({ isOpen, onClose }: SendingModalProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => onClose(), 500)
            return 100
          }
          return prev + 2
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Enviando información</h2>
              <p className="text-gray-600">Por favor espera mientras procesamos tu solicitud...</p>
            </div>

            {/* Animación de datos moviéndose */}
            <div className="relative mb-6 h-12 bg-gray-50 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              </div>

              {/* Partículas animadas */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 w-2 h-2 bg-orange-400 rounded-full"
                  initial={{ x: 16, y: -4, opacity: 0 }}
                  animate={{
                    x: "calc(100vw - 80px)",
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Línea de conexión animada */}
              <motion.div
                className="absolute top-1/2 h-0.5 bg-gradient-to-r from-orange-400 to-transparent"
                initial={{ width: 0, x: 16 }}
                animate={{ width: "calc(100% - 32px)" }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            </div>

            {/* Barra de progreso */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-orange-400 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: progress + "%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Efecto de brillo en la barra */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Indicador de estado */}
            <div className="mt-6 flex items-center justify-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-orange-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="w-2 h-2 bg-orange-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-orange-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}