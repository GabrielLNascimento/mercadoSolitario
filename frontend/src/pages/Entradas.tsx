import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Entradas.css'

interface Produto {
  nome: string
}

interface ItemEntrada {
  id: number
  quantidade: number
  produto: Produto
}

interface Entrada {
  id: number
  criadoEm: string
  itens: ItemEntrada[]
}

export default function Entradas() {
  const navigate = useNavigate()
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [carregando, setCarregando] = useState(true)
  const API_URL = import.meta.env.VITE_API_URL ?? ''

  useEffect(() => {
    fetch(`${API_URL}/api/entradas`)
      .then((res) => res.json())
      .then((data) => setEntradas(data))
      .finally(() => setCarregando(false))
  }, [])

  async function excluirEntrada(id: number) {
    if (!confirm('Excluir esta entrada? O estoque será revertido.')) return
    await fetch(`${API_URL}/api/entradas/${id}`, { method: 'DELETE' })
    setEntradas((prev) => prev.filter((e) => e.id !== id))
  }

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const totalItens = (itens: ItemEntrada[]) =>
    itens.reduce((acc, item) => acc + item.quantidade, 0)

  return (
    <div className="pagina-entradas">
      <div className="pagina-header">
        <h1>Entradas</h1>
        <button className="btn-novo" onClick={() => navigate('/entradas/nova')}>
          + Adicionar Entrada
        </button>
      </div>

      {carregando && <p className="info">Carregando...</p>}

      {!carregando && entradas.length === 0 && (
        <p className="info">Nenhuma entrada registrada ainda.</p>
      )}

      {!carregando && entradas.length > 0 && (
        <div className="lista-entradas">
          {entradas.map((entrada) => (
            <div key={entrada.id} className="card-entrada">
              <div className="card-entrada-header">
                <span className="entrada-data">{formatarData(entrada.criadoEm)}</span>
                <div className="card-entrada-header-right">
                  <span className="entrada-itens-count">{totalItens(entrada.itens)} unidade(s)</span>
                  <button className="btn-excluir-entrada" onClick={() => excluirEntrada(entrada.id)}>Excluir</button>
                </div>
              </div>
              <ul className="entrada-itens">
                {entrada.itens.map((item) => (
                  <li key={item.id}>
                    <span>{item.produto.nome}</span>
                    <span className="item-qtd">+{item.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
