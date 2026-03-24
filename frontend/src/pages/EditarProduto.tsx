import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './CadastrarProduto.css'

interface FormData {
  nome: string
  preco: string
  categoria: string
}

export default function EditarProduto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({ nome: '', preco: '', categoria: '' })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/produtos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          nome: data.nome,
          preco: String(data.preco),
          categoria: data.categoria ?? '',
        })
      })
      .catch(() => setErro('Erro ao carregar produto.'))
      .finally(() => setCarregando(false))
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${API_URL}/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          preco: Number(form.preco),
          categoria: form.categoria,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.erro || 'Erro ao salvar.')
      }

      navigate('/estoque')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p style={{ padding: '2rem' }}>Carregando...</p>

  return (
    <div className="pagina-cadastro">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/estoque')}
          style={{ background: 'none', border: '1px solid #d1d5db', color: '#6b7280', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          ← Voltar
        </button>
        <h1 style={{ margin: 0 }}>Editar Produto</h1>
      </div>

      {erro && <p className="alerta erro">{erro}</p>}

      <form className="formulario" onSubmit={handleSubmit}>
        <div className="campo">
          <label htmlFor="nome">Nome *</label>
          <input id="nome" name="nome" type="text" value={form.nome} onChange={handleChange} required />
        </div>

        <div className="campo">
          <label htmlFor="preco">Preço (R$) *</label>
          <input id="preco" name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={handleChange} required />
        </div>

        <div className="campo">
          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" name="categoria" value={form.categoria} onChange={handleChange}>
            <option value="">Selecione...</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Higiene">Higiene</option>
            <option value="Limpeza">Limpeza</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}
