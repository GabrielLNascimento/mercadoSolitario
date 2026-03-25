import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Familias.css'

interface Familia {
  id: number
  nomePai: string
  nomeMae: string
}

export default function Familias() {
  const [familias, setFamilias] = useState<Familia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  async function deletar(id: number) {
    if (!confirm('Deseja excluir esta família?')) return
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    await fetch(`${API_URL}/api/familias/${id}`, { method: 'DELETE' })
    setFamilias((prev) => prev.filter((f) => f.id !== id))
  }

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/familias`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar famílias.')
        return res.json()
      })
      .then((data) => setFamilias(data))
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <div className="pagina-familias">
      <div className="pagina-header">
        <h1>Famílias</h1>
        <button className="btn-novo" onClick={() => navigate('/familias/cadastrar')}>
          + Nova Família
        </button>
      </div>

      {carregando && <p className="info">Carregando famílias...</p>}
      {erro && <p className="alerta erro">{erro}</p>}

      {!carregando && !erro && familias.length === 0 && (
        <p className="info">Nenhuma família cadastrada ainda.</p>
      )}

      {!carregando && familias.length > 0 && (
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome do Pai</th>
                <th>Nome da Mãe</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {familias.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.nomePai}</td>
                  <td>{f.nomeMae}</td>
                  <td className="acoes-col">
                    <button className="btn-compras" onClick={() => navigate(`/familias/${f.id}/compras`)}>Compras</button>
                    <button className="btn-editar" onClick={() => navigate(`/familias/${f.id}/editar`)}>Editar</button>
                    <button className="btn-deletar" onClick={() => deletar(f.id)}>Excluir</button>
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
