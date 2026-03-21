import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { ProdutoDetalhe } from './pages/ProdutoDetalhe'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { MeuPerfil } from './pages/MeuPerfil'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CarrinhoPage } from './pages/CarrinhoPage'
import { Produtos } from './pages/Produtos'
import { PortalInterno } from './pages/PortalInterno'
import { AppLayout } from './pages/AppLayout'
import { Admin } from './pages/Admin'
import { Estoque } from './pages/Estoque'
import { Compras } from './pages/Compras'
import { VendasClientes } from './pages/VendasClientes'
import { GestaoArquivos } from './pages/GestaoArquivos'
import { Perfil } from './pages/Perfil'
import { EstoqueParametrizacoes } from './pages/EstoqueParametrizacoes'
import { MeusOrcamentos } from './pages/MeusOrcamentos'
import { OrcamentoDetalhe } from './pages/OrcamentoDetalhe'

export const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Rotas públicas — redireciona funcionário/admin para portal interno */}
            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="/produto/:id" element={<PublicRoute><ProdutoDetalhe /></PublicRoute>} />
            <Route path="/carrinho" element={<PublicRoute><CarrinhoPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Rotas para CLIENTE autenticado */}
            <Route
              path="/meus-orcamentos"
              element={
                <ProtectedRoute allowCliente>
                  <MeusOrcamentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meus-orcamentos/:id"
              element={
                <ProtectedRoute allowCliente>
                  <OrcamentoDetalhe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meu-perfil"
              element={
                <ProtectedRoute allowCliente>
                  <MeuPerfil />
                </ProtectedRoute>
              }
            />

            {/* Layout interno + rotas protegidas para FUNCIONARIO e ADMIN */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="portal-interno" element={<PortalInterno />} />
              <Route path="compras" element={<Compras />} />
              <Route path="perfil" element={<Perfil />} />

              {/* Rotas que FUNCIONARIO e ADMIN acessam */}
              <Route path="estoque" element={<Estoque />} />
              <Route path="estoque/parametrizacoes" element={<EstoqueParametrizacoes />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="vendas-clientes" element={<VendasClientes />} />
              <Route path="gestao-arquivos" element={<GestaoArquivos />} />

              {/* Apenas ADMIN */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="admin" element={<Admin />} />
              </Route>
            </Route>

            {/* Redirecionar qualquer rota não encontrada para login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}