import { PackageSearch } from 'lucide-react'
import React from 'react'

function gestionDeMercancias() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600">
              <PackageSearch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestión de mercancías
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default gestionDeMercancias