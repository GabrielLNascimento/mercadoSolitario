import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './NovaCompra.css'

interface Produto {
  id: number
  nome: string
  categoria: string | null
  quantidade: number
}

export default function NovaEntrada() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [selecionados, setSelecionados] = useState<Record<number, number>>({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/produtos`)
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .finally(() => setCarregando(false))
  }, [])

  function toggleProduto(id: number) {
    setSelecionados((prev) => {
      if (prev[id] !== undefined) {
        const novo = { ...prev }
        delete novo[id]
        return novo
      }
      return { ...prev, [id]: 1 }
    })
  }

  function setQuantidade(id: number, qtd: number) {
    if (qtd < 1) return
    setSelecionados((prev) => ({ ...prev, [id]: qtd }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    const itens = Object.entries(selecionados).map(([produtoId, quantidade]) => ({
      produtoId: Number(produtoId),
      quantidade,
    }))

    if (itens.length === 0) {
      setErro('Selecione ao menos um produto.')
      return
    }

    setSalvando(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${API_URL}/api/entradas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.erro || 'Erro ao registrar entrada.')
      }

      navigate('/entradas')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSalvando(false)
    }
  }

  const porCategoria = produtos.reduce<Record<string, Produto[]>>((acc, p) => {
    const cat = p.categoria ?? 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="pagina-nova-compra">
      <div className="pagina-header">
        <div className="header-esquerda">
          <button className="btn-voltar" onClick={() => navigate('/entradas')}>
            ← Voltar
          </button>
          <h1>Nova Entrada</h1>
        </div>
      </div>

      {erro && <p className="alerta erro">{erro}</p>}

      {carregando && <p className="info">Carregando produtos...</p>}

      {!carregando && produtos.length === 0 && (
        <p className="info">Nenhum produto cadastrado.</p>
      )}

      {!carregando && produtos.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="categorias">
            {Object.entries(porCategoria).map(([categoria, lista]) => (
              <div key={categoria} className="grupo-categoria">
                <h2>{categoria}</h2>
                <div className="lista-produtos">
                  {lista.map((p) => {
                    const selecionado = selecionados[p.id] !== undefined
                    return (
                      <div
                        key={p.id}
                        className={`item-produto ${selecionado ? 'selecionado' : ''}`}
                        onClick={() => toggleProduto(p.id)}
                      >
                        <div className="item-info">
                          <span className="item-nome">{p.nome}</span>
                          <span className="item-estoque">Estoque atual: {p.quantidade}</span>
                        </div>
                        {selecionado && (
                          <div className="item-qtd-ctrl" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => setQuantidade(p.id, selecionados[p.id] - 1)}>−</button>
                            <span>{selecionados[p.id]}</span>
                            <button type="button" onClick={() => setQuantidade(p.id, selecionados[p.id] + 1)}>+</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rodape-form">
            <span className="resumo-selecionados">
              {Object.keys(selecionados).length} produto(s) selecionado(s)
            </span>
            <button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Finalizar Entrada'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
