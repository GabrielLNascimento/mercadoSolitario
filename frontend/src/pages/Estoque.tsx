import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Estoque.css'

interface Produto {
  id: number
  nome: string
  quantidade: number
  preco: number
  categoria: string | null
  criadoEm: string
}

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  async function deletar(id: number) {
    if (!confirm('Deseja excluir este produto?')) return
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    await fetch(`${API_URL}/api/produtos/${id}`, { method: 'DELETE' })
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }

  async function ajustarQuantidade(id: number, operacao: 'incrementar' | 'decrementar') {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    const res = await fetch(`${API_URL}/api/produtos/${id}/quantidade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operacao }),
    })
    if (!res.ok) return
    const atualizado = await res.json()
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, quantidade: atualizado.quantidade } : p)))
  }

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/produtos`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar produtos.')
        return res.json()
      })
      .then((data) => setProdutos(data))
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  const formatarPreco = (preco: number) =>
    preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="pagina-estoque">
      <div className="pagina-header">
        <h1>Estoque</h1>
        <button className="btn-novo" onClick={() => navigate('/cadastrar')}>
          + Novo Produto
        </button>
      </div>

      {carregando && <p className="info">Carregando produtos...</p>}
      {erro && <p className="alerta erro">{erro}</p>}

      {!carregando && !erro && produtos.length === 0 && (
        <p className="info">Nenhum produto cadastrado ainda.</p>
      )}

      {!carregando && produtos.length > 0 && (
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.nome}</strong></td>
                  <td>{p.categoria ?? '—'}</td>
                  <td>
                    <div className="qtd-ctrl">
                      <button className="qtd-btn" onClick={() => ajustarQuantidade(p.id, 'decrementar')} disabled={p.quantidade === 0}>−</button>
                      <span className={`badge ${p.quantidade === 0 ? 'zero' : ''}`}>{p.quantidade}</span>
                      <button className="qtd-btn" onClick={() => ajustarQuantidade(p.id, 'incrementar')}>+</button>
                    </div>
                  </td>
                  <td>{formatarPreco(p.preco)}</td>
                  <td className="acoes-col">
                    <button className="btn-editar" onClick={() => navigate(`/estoque/${p.id}/editar`)}>Editar</button>
                    <button className="btn-deletar" onClick={() => deletar(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
