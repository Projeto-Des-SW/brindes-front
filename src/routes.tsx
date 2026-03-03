import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './pages/AppLayout'
import { Admin } from './pages/Admin'
import { Estoque } from './pages/Estoque'
import { Compras } from './pages/Compras'
import { VendasClientes } from './pages/VendasClientes'
import { GestaoArquivos } from './pages/GestaoArquivos'
import { Perfil } from './pages/Perfil'
import { Configuracoes } from './pages/Configuracoes'
import { EstoqueParametrizacoes } from './pages/EstoqueParametrizacoes'

export const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="admin" element={<Admin />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="estoque/parametrizacoes" element={<EstoqueParametrizacoes />} />
            <Route path="compras" element={<Compras />} />
            <Route path="vendas-clientes" element={<VendasClientes />} />
            <Route path="gestao-arquivos" element={<GestaoArquivos />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>

          {/* Redirecionar qualquer rota não encontrada para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
