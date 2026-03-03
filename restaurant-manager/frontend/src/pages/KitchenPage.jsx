import { useEffect, useState } from 'react'
import api from '../services/api'
import { subscribeToKitchen } from '../services/echo'
import { Clock, CheckCircle, RefreshCw, ChefHat } from 'lucide-react'
import toast from 'react-hot-toast'

const itemStatusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', next: 'preparing', nextLabel: 'Commencer' },
  preparing: { label: 'En cours', color: 'bg-orange-100 text-orange-700', next: 'ready', nextLabel: 'Terminé' },
  ready: { label: 'Prêt', color: 'bg-green-100 text-green-700', next: null },
  served: { label: 'Servi', color: 'bg-gray-100 text-gray-500', next: null },
}

function getElapsedMinutes(dateString) {
  return Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
}

function getUrgencyColor(minutes) {
  if (minutes > 30) return 'border-red-400 bg-red-50'
  if (minutes > 20) return 'border-orange-400 bg-orange-50'
  return 'border-gray-200 bg-white'
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await api.get('/orders/kitchen')
      setOrders(data)
    } catch {
      toast.error('Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)

    const unsubscribe = subscribeToKitchen((data) => {
      const status = data.order.status
      if (['confirmed', 'preparing'].includes(status)) {
        toast.success(`Nouvelle commande: ${data.order.order_number}`, { icon: '👨‍🍳' })
        load()
      } else {
        load()
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success('Commande mise à jour')
      load()
    } catch {
      toast.error('Erreur')
    }
  }

  const updateItemStatus = async (orderId, itemId, status) => {
    try {
      await api.patch(`/orders/${orderId}/items/${itemId}/status`, { status })
      load()
    } catch {
      toast.error('Erreur')
    }
  }

  const pending = orders.filter(o => o.status === 'confirmed')
  const preparing = orders.filter(o => o.status === 'preparing')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <ChefHat size={20} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cuisine</h1>
            <p className="text-sm text-gray-500">{orders.length} commande(s) en cours</p>
          </div>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={16} /> Actualiser</button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-16 text-center">
          <ChefHat size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Aucune commande en attente</p>
          <p className="text-sm text-gray-300 mt-1">La cuisine est calme pour l'instant</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <h2 className="font-bold text-gray-700">En attente ({pending.length})</h2>
            </div>
            <div className="space-y-4">
              {pending.map(order => {
                const elapsed = getElapsedMinutes(order.created_at)
                return (
                  <div key={order.id} className={`card border-2 p-5 ${getUrgencyColor(elapsed)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">Table {order.table?.number}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/80 rounded-lg px-3 py-1.5 border">
                        <Clock size={14} className={elapsed > 20 ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-sm font-bold ${elapsed > 20 ? 'text-red-500' : 'text-gray-600'}`}>
                          {elapsed} min
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
                          <span className="font-bold text-orange-600 text-lg">{item.quantity}×</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.menu_item?.name}</p>
                            {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                          </div>
                          <span className={`badge ${itemStatusConfig[item.status]?.color}`}>
                            {itemStatusConfig[item.status]?.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-xs text-gray-500 italic bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4">
                        📝 {order.notes}
                      </p>
                    )}

                    <button onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="btn-primary w-full justify-center">
                      🔥 Commencer la préparation
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preparing column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              <h2 className="font-bold text-gray-700">En préparation ({preparing.length})</h2>
            </div>
            <div className="space-y-4">
              {preparing.map(order => {
                const elapsed = getElapsedMinutes(order.confirmed_at || order.created_at)
                return (
                  <div key={order.id} className={`card border-2 p-5 ${getUrgencyColor(elapsed)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">Table {order.table?.number}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/80 rounded-lg px-3 py-1.5 border">
                        <Clock size={14} className={elapsed > 20 ? 'text-red-500' : 'text-orange-400'} />
                        <span className={`text-sm font-bold ${elapsed > 20 ? 'text-red-500' : 'text-orange-500'}`}>
                          {elapsed} min
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.filter(i => i.status !== 'served').map(item => {
                        const cfg = itemStatusConfig[item.status]
                        return (
                          <div key={item.id} className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
                            <span className="font-bold text-orange-600 text-lg">{item.quantity}×</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{item.menu_item?.name}</p>
                              {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                            </div>
                            {cfg?.next && (
                              <button onClick={() => updateItemStatus(order.id, item.id, cfg.next)}
                                className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors font-medium whitespace-nowrap">
                                {cfg.nextLabel}
                              </button>
                            )}
                            {item.status === 'ready' && (
                              <CheckCircle size={20} className="text-green-500" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <button onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-xl transition-colors">
                      <CheckCircle size={18} /> Tout est prêt !
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
