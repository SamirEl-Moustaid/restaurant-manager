import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewOrderPage() {
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const tableId = params.get('table')
    if (tableId) setSelectedTable(tableId)

    Promise.all([
      api.get('/menu/categories'),
      api.get('/tables')
    ]).then(([catRes, tableRes]) => {
      setCategories(catRes.data)
      setTables(tableRes.data)
      if (catRes.data.length > 0) setActiveCategory(catRes.data[0].id)
    })
  }, [])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1, itemNotes: '' }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
      return updated.filter(c => c.qty > 0)
    })
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalTTC = total * 1.2

  const currentItems = categories.find(c => c.id === activeCategory)?.menu_items || []

  const handleSubmit = async () => {
    if (!selectedTable) return toast.error('Sélectionnez une table')
    if (cart.length === 0) return toast.error('Ajoutez des articles')
    setLoading(true)
    try {
      await api.post('/orders', {
        table_id: selectedTable,
        notes,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.qty,
          notes: item.itemNotes || undefined,
        }))
      })
      toast.success('Commande créée !')
      navigate('/orders')
    } catch {
      toast.error('Erreur création commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle commande</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-4">
          {/* Table selector */}
          <div className="card p-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Table</label>
            <select className="input" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
              <option value="">Sélectionner une table...</option>
              {tables.filter(t => t.status === 'available' || String(t.id) === selectedTable)
                .map(t => (
                  <option key={t.id} value={t.id}>Table {t.number} — {t.location} ({t.capacity} pers.)</option>
                ))}
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currentItems.filter(i => i.is_available).map(item => {
              const inCart = cart.find(c => c.id === item.id)
              return (
                <div key={item.id}
                  onClick={() => addToCart(item)}
                  className={`card p-4 cursor-pointer hover:shadow-md transition-all hover:border-orange-200 hover:-translate-y-0.5 ${inCart ? 'border-orange-300 bg-orange-50' : ''}`}>
                  <div className="text-2xl mb-2">🍽️</div>
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-orange-600">{parseFloat(item.price).toFixed(2)} €</span>
                    {inCart && (
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {inCart.qty}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">⏱ {item.preparation_time} min</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={20} className="text-orange-500" />
              <h3 className="font-bold text-gray-900">Commande ({cart.length})</h3>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Aucun article</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-orange-600 font-semibold">{(item.price * item.qty).toFixed(2)} €</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white rounded-lg border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white rounded-lg border flex items-center justify-center hover:bg-green-50 hover:border-green-200 transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => setCart(prev => prev.filter(c => c.id !== item.id))} className="w-7 h-7 text-red-400 hover:text-red-600 flex items-center justify-center">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                className="input text-xs resize-none" rows={2} placeholder="Instructions spéciales..." />
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium">{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA (20%)</span>
                <span className="font-medium">{(total * 0.2).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total TTC</span>
                <span className="text-orange-600">{totalTTC.toFixed(2)} €</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !cart.length || !selectedTable}
              className="btn-primary w-full justify-center mt-4 py-3">
              {loading ? 'Envoi...' : 'Envoyer en cuisine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
