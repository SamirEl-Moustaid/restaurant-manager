import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { Receipt, Plus, Search, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [servedOrders, setServedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBillModal, setShowBillModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [payment, setPayment] = useState({ method: 'cash', discount: 0 })
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [params] = useSearchParams()

  const load = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/orders?status=served'),
      ])
      setInvoices(invRes.data.data || [])
      setServedOrders(ordRes.data.data || [])

      const orderId = params.get('order')
      if (orderId) {
        const order = ordRes.data.data?.find(o => String(o.id) === orderId)
        if (order) { setSelectedOrder(order); setShowBillModal(true) }
      }
    } catch {
      toast.error('Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const generateInvoice = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return
    try {
      await api.post(`/invoices/order/${selectedOrder.id}`, {
        payment_method: payment.method,
        discount: payment.discount,
      })
      toast.success('Facture générée !')
      setShowBillModal(false)
      setSelectedOrder(null)
      load()
    } catch {
      toast.error('Erreur génération facture')
    }
  }

  const total = selectedOrder ? parseFloat(selectedOrder.subtotal) : 0
  const discountAmt = total * (payment.discount / 100)
  const afterDiscount = total - discountAmt
  const tax = afterDiscount * 0.2
  const grandTotal = afterDiscount + tax

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
        {servedOrders.length > 0 && (
          <button onClick={() => setShowBillModal(true)} className="btn-primary">
            <Plus size={18} /> Nouvelle facture
          </button>
        )}
      </div>

      {/* Served orders pending billing */}
      {servedOrders.length > 0 && (
        <div className="card p-4 border-2 border-orange-200 bg-orange-50">
          <p className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Receipt size={18} /> {servedOrders.length} commande(s) à facturer
          </p>
          <div className="flex flex-wrap gap-2">
            {servedOrders.map(order => (
              <button key={order.id} onClick={() => { setSelectedOrder(order); setShowBillModal(true) }}
                className="bg-white border-2 border-orange-300 hover:border-orange-400 rounded-xl px-4 py-2 text-sm font-medium text-orange-700 transition-colors">
                {order.order_number} — Table {order.table?.number} — {parseFloat(order.total).toFixed(2)} €
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Invoices list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historique des factures</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {invoices.length === 0 ? (
            <p className="text-center py-12 text-gray-400">Aucune facture</p>
          ) : invoices.map(inv => (
            <div key={inv.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedInvoice?.id === inv.id ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Receipt size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{inv.invoice_number}</p>
                <p className="text-xs text-gray-400">
                  Table {inv.order?.table?.number} · {new Date(inv.created_at).toLocaleDateString('fr-FR')} · {inv.payment_method}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{parseFloat(inv.total).toFixed(2)} €</p>
                <span className="badge bg-green-100 text-green-700">Payée</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill generation modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Générer une facture</h3>

            {/* Order selector */}
            {!selectedOrder && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commande</label>
                <select className="input" onChange={e => setSelectedOrder(servedOrders.find(o => String(o.id) === e.target.value))}>
                  <option value="">Sélectionner...</option>
                  {servedOrders.map(o => (
                    <option key={o.id} value={o.id}>{o.order_number} — Table {o.table?.number}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedOrder && (
              <form onSubmit={generateInvoice} className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>{selectedOrder.order_number}</span>
                    <span>Table {selectedOrder.table?.number}</span>
                  </div>
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-gray-600">
                      <span>{item.quantity}× {item.menu_item?.name}</span>
                      <span>{parseFloat(item.total_price).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                  <select className="input" value={payment.method} onChange={e => setPayment({...payment, method: e.target.value})}>
                    <option value="cash">💵 Espèces</option>
                    <option value="card">💳 Carte bancaire</option>
                    <option value="mobile">📱 Paiement mobile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
                  <input type="number" min="0" max="100" className="input" value={payment.discount}
                    onChange={e => setPayment({...payment, discount: parseFloat(e.target.value) || 0})} />
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total HT</span><span>{total.toFixed(2)} €</span>
                  </div>
                  {payment.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise ({payment.discount}%)</span><span>-{discountAmt.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>TVA (20%)</span><span>{tax.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-orange-200 pt-2">
                    <span>Total TTC</span><span className="text-orange-600">{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowBillModal(false); setSelectedOrder(null) }}
                    className="btn-secondary flex-1 justify-center">Annuler</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    <Receipt size={18} /> Valider
                  </button>
                </div>
              </form>
            )}

            {!selectedOrder && servedOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Aucune commande servie à facturer</p>
                <button onClick={() => setShowBillModal(false)} className="btn-secondary mt-4 mx-auto">Fermer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
