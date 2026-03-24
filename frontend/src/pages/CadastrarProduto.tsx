import { useState, FormEvent } from 'react'
import './CadastrarProduto.css'

interface FormData {
  nome: string
  preco: string
  categoria: string
}

const FORM_INICIAL: FormData = {
  nome: '',
  preco: '',
  categoria: '',
}

export default function CadastrarProduto() {
  const [form, setForm] = useState<FormData>(FORM_INICIAL)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso(false)
    setCarregando(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${API_URL}/api/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          preco: Number(form.preco),
          categoria: form.categoria,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.erro || 'Erro ao cadastrar produto.')
      }

      setForm(FORM_INICIAL)
      setSucesso(true)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="pagina-cadastro">
      <h1>Cadastrar Produto</h1>

      {sucesso && <p className="alerta sucesso">Produto cadastrado com sucesso!</p>}
      {erro && <p className="alerta erro">{erro}</p>}

      <form className="formulario" onSubmit={handleSubmit}>
        <div className="campo">
          <label htmlFor="nome">Nome *</label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={form.nome}
            onChange={handleChange}
            placeholder="Nome do produto"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="preco">Preço (R$) *</label>
          <input
            id="preco"
            name="preco"
            type="number"
            min="0"
            step="0.01"
            value={form.preco}
            onChange={handleChange}
            placeholder="0,00"
            required
          />
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

        <button type="submit" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar Produto'}
        </button>
      </form>
    </div>
  )
}
