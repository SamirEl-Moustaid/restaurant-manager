import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MenuPage from './pages/MenuPage'
import TablesPage from './pages/TablesPage'
import OrdersPage from './pages/OrdersPage'
import KitchenPage from './pages/KitchenPage'
import InvoicesPage from './pages/InvoicesPage'
import NewOrderPage from './pages/NewOrderPage'

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '10px', fontFamily: 'Inter' }
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="menu" element={
            <PrivateRoute roles={['admin', 'waiter', 'chef']}>
              <MenuPage />
            </PrivateRoute>
          } />
          <Route path="tables" element={
            <PrivateRoute roles={['admin', 'waiter']}>
              <TablesPage />
            </PrivateRoute>
          } />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/new" element={
            <PrivateRoute roles={['admin', 'waiter']}>
              <NewOrderPage />
            </PrivateRoute>
          } />
          <Route path="kitchen" element={
            <PrivateRoute roles={['admin', 'chef']}>
              <KitchenPage />
            </PrivateRoute>
          } />
          <Route path="invoices" element={
            <PrivateRoute roles={['admin', 'cashier', 'waiter']}>
              <InvoicesPage />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
