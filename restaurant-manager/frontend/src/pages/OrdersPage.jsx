import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { subscribeToOrders } from '../services/echo'
import { Plus, ChevronRight, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', next: 'confirmed', nextLabel: 'Confirmer' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', next: 'preparing', nextLabel: 'Préparer' },
  preparing: { label: 'En préparation', color: 'bg-orange-100 text-orange-700', next: 'ready', nextLabel: 'Prêt' },
  ready: { label: 'Prête', color: 'bg-green-100 text-green-700', next: 'served', nextLabel: 'Servi' },
  served: { label: 'Servie', color: 'bg-teal-100 text-teal-700', next: null },
  paid: { label: 'Payée', color: 'bg-gray-100 text-gray-600', next: null },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-600', next: null },
}

const filters = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prêtes' },
  { value: 'served', label: 'Servies' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const params = filter ? `?status=${filter}` : ''
      const { data } = await api.get(`/orders${params}`)
      setOrders(data.data || [])
    } catch {
      toast.error('Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      toast.success(`Commande ${data.order.order_number} mise à jour: ${statusConfig[data.order.status]?.label}`)
      load()
    })
    return unsubscribe
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success('Statut mis à jour')
      load()
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary"><RefreshCw size={16} /></button>
          <button onClick={() => navigate('/orders/new')} className="btn-primary"><Plus size={18} /> Nouvelle</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.value ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">Aucune commande</div>
          ) : orders.map(order => {
            const cfg = statusConfig[order.status]
            return (
              <div key={order.id} className="card p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-900">{order.order_number}</span>
                      <span className="text-sm text-gray-500">Table {order.table?.number}</span>
                      <span className={`badge ${cfg?.color}`}>{cfg?.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.items?.length} article(s) · {order.user?.name} · {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{parseFloat(order.total).toFixed(2)} €</p>
                    </div>
                    <ChevronRight size={18} className={`text-gray-400 transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid gap-2 mb-4">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.menu_item?.name}</span>
                          <span className="font-medium">{parseFloat(item.total_price).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && <p className="text-xs text-gray-500 italic mb-4">📝 {order.notes}</p>}
                    <div className="flex gap-2 flex-wrap">
                      {cfg?.next && (
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, cfg.next) }}
                          className="btn-primary text-sm py-1.5">
                          {cfg.nextLabel}
                        </button>
                      )}
                      {order.status === 'served' && (
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices?order=${order.id}`) }}
                          className="btn-primary text-sm py-1.5">
                          Facturer
                        </button>
                      )}
                      {!['paid', 'cancelled'].includes(order.status) && (
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'cancelled') }}
                          className="btn-danger text-sm py-1.5">
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
