import { Routes, Route } from 'react-router-dom'
import Menu from './components/Menu'
import Home from './pages/Home'
import CadastrarProduto from './pages/CadastrarProduto'
import CadastrarFamilia from './pages/CadastrarFamilia'
import Familias from './pages/Familias'
import ComprasFamilia from './pages/ComprasFamilia'
import NovaCompra from './pages/NovaCompra'
import EditarCompra from './pages/EditarCompra'
import Estoque from './pages/Estoque'
import EditarProduto from './pages/EditarProduto'
import Entradas from './pages/Entradas'
import NovaEntrada from './pages/NovaEntrada'
import './App.css'

function App() {
  return (
    <div className="app">
      <Menu />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastrar" element={<CadastrarProduto />} />
          <Route path="/familias/cadastrar" element={<CadastrarFamilia />} />
          <Route path="/familias" element={<Familias />} />
          <Route path="/familias/:familiaId/compras" element={<ComprasFamilia />} />
          <Route path="/familias/:familiaId/compras/nova" element={<NovaCompra />} />
          <Route path="/familias/:familiaId/compras/:compraId/editar" element={<EditarCompra />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/estoque/:id/editar" element={<EditarProduto />} />
          <Route path="/entradas" element={<Entradas />} />
          <Route path="/entradas/nova" element={<NovaEntrada />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
