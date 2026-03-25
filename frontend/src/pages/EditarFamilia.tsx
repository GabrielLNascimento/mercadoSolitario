import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './CadastrarFamilia.css'

interface Filho {
  id: number
  nome: string
}

export default function EditarFamilia() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [nomePai, setNomePai] = useState('')
  const [dataNascPai, setDataNascPai] = useState('')
  const [nomeMae, setNomeMae] = useState('')
  const [dataNascMae, setDataNascMae] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [filhos, setFilhos] = useState<Filho[]>([{ id: Date.now(), nome: '' }])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? ''
    fetch(`${API_URL}/api/familias/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar família.')
        return res.json()
      })
      .then((data) => {
        setNomePai(data.nomePai)
        setDataNascPai(data.dataNascPai ? data.dataNascPai.substring(0, 10) : '')
        setNomeMae(data.nomeMae)
        setDataNascMae(data.dataNascMae ? data.dataNascMae.substring(0, 10) : '')
        setEndereco(data.endereco ?? '')
        setTelefone(data.telefone ?? '')
        setFilhos(
          data.filhos.length > 0
            ? data.filhos.map((f: { id: number; nome: string }) => ({ id: f.id, nome: f.nome }))
            : [{ id: Date.now(), nome: '' }]
        )
      })
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [id])

  function adicionarFilho() {
    setFilhos((prev) => [...prev, { id: Date.now(), nome: '' }])
  }

  function removerFilho(fid: number) {
    setFilhos((prev) => prev.filter((f) => f.id !== fid))
  }

  function atualizarFilho(fid: number, nome: string) {
    setFilhos((prev) => prev.map((f) => (f.id === fid ? { ...f, nome } : f)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${API_URL}/api/familias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomePai,
          dataNascPai: dataNascPai || null,
          nomeMae,
          dataNascMae: dataNascMae || null,
          endereco: endereco || null,
          telefone: telefone || null,
          filhos: filhos.map((f) => ({ nome: f.nome })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.erro || 'Erro ao salvar família.')
      }

      navigate('/familias')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p style={{ padding: '2rem' }}>Carregando...</p>

  return (
    <div className="pagina-familia">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/familias')}
          style={{ background: 'none', border: '1px solid #d1d5db', color: '#6b7280', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          ← Voltar
        </button>
        <h1 style={{ margin: 0 }}>Editar Família</h1>
      </div>

      {erro && <p className="alerta erro">{erro}</p>}

      <form className="formulario" onSubmit={handleSubmit}>

        <div className="secao-titulo-bloco">Pai</div>
        <div className="linha-dupla">
          <div className="campo">
            <label htmlFor="nomePai">Nome completo *</label>
            <input
              id="nomePai"
              type="text"
              value={nomePai}
              onChange={(e) => setNomePai(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="dataNascPai">Data de nascimento</label>
            <input
              id="dataNascPai"
              type="date"
              value={dataNascPai}
              onChange={(e) => setDataNascPai(e.target.value)}
            />
          </div>
        </div>

        <div className="secao-titulo-bloco">Mãe</div>
        <div className="linha-dupla">
          <div className="campo">
            <label htmlFor="nomeMae">Nome completo *</label>
            <input
              id="nomeMae"
              type="text"
              value={nomeMae}
              onChange={(e) => setNomeMae(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="dataNascMae">Data de nascimento</label>
            <input
              id="dataNascMae"
              type="date"
              value={dataNascMae}
              onChange={(e) => setDataNascMae(e.target.value)}
            />
          </div>
        </div>

        <div className="secao-titulo-bloco">Contato</div>
        <div className="linha-dupla">
          <div className="campo">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="campo">
            <label htmlFor="endereco">Endereço</label>
            <input
              id="endereco"
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </div>
        </div>

        <div className="secao-filhos">
          <div className="secao-filhos-header">
            <span className="secao-titulo">Filhos</span>
            <button type="button" className="btn-adicionar" onClick={adicionarFilho}>
              + Adicionar filho
            </button>
          </div>
          <div className="lista-filhos">
            {filhos.map((filho, index) => (
              <div key={filho.id} className="filho-linha">
                <input
                  type="text"
                  value={filho.nome}
                  onChange={(e) => atualizarFilho(filho.id, e.target.value)}
                  placeholder={`Filho ${index + 1}`}
                />
                {filhos.length > 1 && (
                  <button
                    type="button"
                    className="btn-remover"
                    onClick={() => removerFilho(filho.id)}
                    aria-label="Remover filho"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}
