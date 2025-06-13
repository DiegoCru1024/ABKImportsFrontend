import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null)

 /* useEffect(() => {
    // Obtener token de cookie y decodificar
    const match = document.cookie.match(/(^|;)\s*token=([^;]+)/)
    if (match) {
      try {
        const payload = JSON.parse(atob(match[2]))
        setUser(payload.user)
      } catch {
        setUser(null)
      }
    }
  }, [])*/

  return (
    <div className="container mx-auto p-6" id="dashboard">
      <h1 className="text-2xl font-bold" id="dashboard-title">Dashboard</h1>
      {user && <p className="mt-4">Bienvenido, {user}!</p>}
      {!user && <p className="mt-4">Cargando...</p>}
    </div>
  );
}