import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ComprasFamilia.css'

interface Produto {
  nome: string
  preco: number
}

interface Item {
  id: number
  quantidade: number
  produto: Produto
}

interface Compra {
  id: number
  criadoEm: string
  itens: Item[]
}

export default function ComprasFamilia() {
  const { familiaId } = useParams()
  const navigate = useNavigate()
  const [compras, setCompras] = useState<Compra[]>([])
  const [carregando, setCarregando] = useState(true)

  async function deletar(id: number) {
    if (!confirm('Deseja excluir esta compra? O estoque será devolvido.')) return
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    await fetch(`${API_URL}/api/familias/${familiaId}/compras/${id}`, { method: 'DELETE' })
    setCompras((prev) => prev.filter((c) => c.id !== id))
  }

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/familias/${familiaId}/compras`)
      .then((res) => res.json())
      .then((data) => setCompras(data))
      .finally(() => setCarregando(false))
  }, [familiaId])

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const formatarPreco = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const totalCompra = (itens: Item[]) =>
    itens.reduce((acc, item) => acc + item.quantidade * item.produto.preco, 0)

  return (
    <div className="pagina-compras">
      <div className="pagina-header">
        <div className="header-esquerda">
          <button className="btn-voltar" onClick={() => navigate('/familias')}>← Voltar</button>
          <h1>Compras da Família</h1>
        </div>
        <button className="btn-novo" onClick={() => navigate(`/familias/${familiaId}/compras/nova`)}>
          + Adicionar Compra
        </button>
      </div>

      {carregando && <p className="info">Carregando...</p>}

      {!carregando && compras.length === 0 && (
        <p className="info">Nenhuma compra registrada ainda.</p>
      )}

      {!carregando && compras.length > 0 && (
        <div className="lista-compras">
          {compras.map((compra) => (
            <div key={compra.id} className="card-compra">
              <div className="card-compra-header">
                <span className="compra-data">{formatarData(compra.criadoEm)}</span>
                <div className="card-compra-acoes">
                  <span className="compra-itens-count">{compra.itens.length} produto(s)</span>
                  <button className="btn-editar-compra" onClick={() => navigate(`/familias/${familiaId}/compras/${compra.id}/editar`)}>Editar</button>
                  <button className="btn-deletar-compra" onClick={() => deletar(compra.id)}>Excluir</button>
                </div>
              </div>
              <ul className="compra-itens">
                {compra.itens.map((item) => (
                  <li key={item.id}>
                    <span>{item.produto.nome}</span>
                    <span className="item-qtd">x{item.quantidade}</span>
                  </li>
                ))}
              </ul>
              <div className="compra-total">
                <span>Total</span>
                <span>{formatarPreco(totalCompra(compra.itens))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
