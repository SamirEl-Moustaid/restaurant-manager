import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, Users, ClipboardList, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig = {
  available: { label: 'Disponible', color: 'bg-green-100 border-green-200', dot: 'bg-green-500', text: 'text-green-700' },
  occupied: { label: 'Occupée', color: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
  reserved: { label: 'Réservée', color: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-700' },
  cleaning: { label: 'Nettoyage', color: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
}

export default function TablesPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ number: '', capacity: 2, location: 'Salle principale' })
  const navigate = useNavigate()

  const load = async () => {
    try {
      const { data } = await api.get('/tables')
      setTables(data)
    } catch {
      toast.error('Erreur chargement tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/tables', form)
      toast.success('Table créée')
      setShowModal(false)
      setForm({ number: '', capacity: 2, location: 'Salle principale' })
      load()
    } catch {
      toast.error('Erreur création table')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tables/${id}`, { status })
      setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur mise à jour')
    }
  }

  const grouped = tables.reduce((acc, table) => {
    const loc = table.location || 'Autre'
    if (!acc[loc]) acc[loc] = []
    acc[loc].push(table)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan des tables</h1>
          <p className="text-sm text-gray-500 mt-1">{tables.filter(t => t.status === 'available').length} / {tables.length} disponibles</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary"><RefreshCw size={16} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={18} /> Ajouter table</button>
        </div>
      </div>

      {Object.entries(grouped).map(([location, locationTables]) => (
        <div key={location}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{location}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {locationTables.map(table => {
              const cfg = statusConfig[table.status]
              return (
                <div key={table.id} className={`card border-2 p-4 ${cfg.color} cursor-pointer hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-2xl text-gray-900">T{table.number}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{table.capacity} pers.</span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.color} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {table.active_order && (
                    <div className="bg-white/70 rounded-lg p-2 mb-3 text-xs">
                      <p className="font-medium text-gray-700">{table.active_order.order_number}</p>
                      <p className="text-gray-500">{table.active_order.items?.length} article(s)</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {table.status === 'available' && (
                      <button onClick={() => navigate(`/orders/new?table=${table.id}`)}
                        className="flex-1 text-xs bg-orange-500 text-white py-1.5 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                        Nouvelle commande
                      </button>
                    )}
                    {table.status === 'occupied' && (
                      <button onClick={() => updateStatus(table.id, 'cleaning')}
                        className="flex-1 text-xs bg-blue-500 text-white py-1.5 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        Libérer
                      </button>
                    )}
                    {table.status === 'cleaning' && (
                      <button onClick={() => updateStatus(table.id, 'available')}
                        className="flex-1 text-xs bg-green-500 text-white py-1.5 rounded-lg hover:bg-green-600 transition-colors font-medium">
                        Disponible
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Nouvelle table</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input className="input" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                <input type="number" min="1" className="input" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                <select className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                  <option>Salle principale</option>
                  <option>Terrasse</option>
                  <option>Salle VIP</option>
                  <option>Bar</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
