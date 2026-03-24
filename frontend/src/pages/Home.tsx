import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

interface Resumo {
  totalProdutos: number
  totalFamilias: number
}

export default function Home() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/dashboard`)
      .then((res) => res.json())
      .then((data) => setResumo(data))
      .catch(() => setResumo({ totalProdutos: 0, totalFamilias: 0 }))
  }, [])

  return (
    <div className="home">
      <div className="home-header">
        <h1>Mercado Solidário</h1>
        <p>Painel de controle</p>
      </div>

      <div className="cards-resumo">
        <div className="card">
          <span className="card-numero">{resumo?.totalProdutos ?? '—'}</span>
          <span className="card-label">Produtos cadastrados</span>
        </div>
        <div className="card">
          <span className="card-numero">{resumo?.totalFamilias ?? '—'}</span>
          <span className="card-label">Famílias cadastradas</span>
        </div>
      </div>

      <div className="acoes">
        <h2>Cadastrar</h2>
        <div className="acoes-grid">
          <button className="acao-btn" onClick={() => navigate('/cadastrar')}>
            <span className="acao-icone">📦</span>
            <span className="acao-titulo">Novo Produto</span>
            <span className="acao-desc">Adicionar produto ao estoque</span>
          </button>
          <button className="acao-btn" onClick={() => navigate('/familias/cadastrar')}>
            <span className="acao-icone">👨‍👩‍👧‍👦</span>
            <span className="acao-titulo">Nova Família</span>
            <span className="acao-desc">Registrar uma família beneficiada</span>
          </button>
        </div>
      </div>
    </div>
  )
}
