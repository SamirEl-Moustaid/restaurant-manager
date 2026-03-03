import { useEffect, useState } from 'react'
import api from '../services/api'
import { TrendingUp, ShoppingBag, Clock, Euro, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'En préparation', color: 'bg-orange-100 text-orange-700' },
  ready: { label: 'Prête', color: 'bg-green-100 text-green-700' },
  served: { label: 'Servie', color: 'bg-teal-100 text-teal-700' },
  paid: { label: 'Payée', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-600' },
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/invoices/stats'),
        api.get('/orders?per_page=8'),
      ])
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data.data || [])
    } catch {
      toast.error('Erreur chargement données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )

  const statCards = [
    { label: "CA du jour", value: `${parseFloat(stats?.today_revenue || 0).toFixed(2)} €`, icon: Euro, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
    { label: "Commandes aujourd'hui", value: stats?.today_orders || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: "CA du mois", value: `${parseFloat(stats?.month_revenue || 0).toFixed(2)} €`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
    { label: "En cours", value: stats?.pending_orders || 0, icon: Clock, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={loadData} className="btn-secondary">
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`card p-5 border ${border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
          <span className="text-xs text-gray-400">Mise à jour auto 30s</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <p className="text-center py-12 text-gray-400">Aucune commande</p>
          ) : recentOrders.map(order => (
            <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <ShoppingBag size={18} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{order.order_number}</p>
                <p className="text-xs text-gray-400">Table {order.table?.number} · {order.items?.length} article(s)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">{parseFloat(order.total).toFixed(2)} €</p>
                <span className={`badge ${statusConfig[order.status]?.color}`}>
                  {statusConfig[order.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
