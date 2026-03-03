import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', preparation_time: 15,
    category_id: '', is_available: true
  })

  const load = async () => {
    try {
      const [catRes, itemsRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items'),
      ])
      setCategories(catRes.data)
      setItems(itemsRes.data)
      if (!activeCategory && catRes.data.length > 0) setActiveCategory(catRes.data[0].id)
    } catch {
      toast.error('Erreur chargement menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditItem(null)
    setForm({ name: '', description: '', price: '', preparation_time: 15, category_id: activeCategory || '', is_available: true })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      name: item.name, description: item.description || '',
      price: item.price, preparation_time: item.preparation_time,
      category_id: item.category_id, is_available: item.is_available,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editItem) {
        await api.put(`/menu/items/${editItem.id}`, form)
        toast.success('Article modifié')
      } else {
        await api.post('/menu/items', form)
        toast.success('Article créé')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Erreur sauvegarde')
    }
  }

  const toggleAvailability = async (item) => {
    try {
      await api.patch(`/menu/items/${item.id}/toggle`)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    } catch {
      toast.error('Erreur')
    }
  }

  const deleteItem = async (item) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return
    try {
      await api.delete(`/menu/items/${item.id}`)
      setItems(prev => prev.filter(i => i.id !== item.id))
      toast.success('Article supprimé')
    } catch {
      toast.error('Erreur suppression')
    }
  }

  const filteredItems = items.filter(i => {
    const matchCat = !activeCategory || i.category_id === activeCategory
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du menu</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Ajouter</button>
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9" placeholder="Rechercher un plat..." />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!activeCategory ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Tous
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Article</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Catégorie</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Prix</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Temps</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dispo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun article</td></tr>
            ) : filteredItems.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.is_available ? 'opacity-60' : ''}`}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</p>}
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-sm text-gray-500">{item.category?.icon} {item.category?.name}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-bold text-orange-600">{parseFloat(item.price).toFixed(2)} €</span>
                </td>
                <td className="px-4 py-4 text-center hidden sm:table-cell">
                  <span className="text-xs text-gray-500">⏱ {item.preparation_time} min</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button onClick={() => toggleAvailability(item)}>
                    {item.is_available
                      ? <Eye size={18} className="text-green-500 mx-auto" />
                      : <EyeOff size={18} className="text-gray-400 mx-auto" />}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={15} className="text-blue-500" />
                    </button>
                    <button onClick={() => deleteItem(item)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">{editItem ? 'Modifier' : 'Nouveau'} article</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select className="input" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps préparation (min)</label>
                  <input type="number" min="1" className="input" value={form.preparation_time} onChange={e => setForm({...form, preparation_time: e.target.value})} />
                </div>
                <div className="flex items-center gap-2 self-end pb-2">
                  <input type="checkbox" id="avail" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="rounded" />
                  <label htmlFor="avail" className="text-sm font-medium text-gray-700">Disponible</label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
