import { useState, FormEvent } from 'react'
import './CadastrarFamilia.css'

interface Filho {
  id: number
  nome: string
}

export default function CadastrarFamilia() {
  const [nomePai, setNomePai] = useState('')
  const [dataNascPai, setDataNascPai] = useState('')
  const [nomeMae, setNomeMae] = useState('')
  const [dataNascMae, setDataNascMae] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [filhos, setFilhos] = useState<Filho[]>([{ id: Date.now(), nome: '' }])
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function adicionarFilho() {
    setFilhos((prev) => [...prev, { id: Date.now(), nome: '' }])
  }

  function removerFilho(id: number) {
    setFilhos((prev) => prev.filter((f) => f.id !== id))
  }

  function atualizarFilho(id: number, nome: string) {
    setFilhos((prev) => prev.map((f) => (f.id === id ? { ...f, nome } : f)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso(false)
    setCarregando(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${API_URL}/api/familias`, {
        method: 'POST',
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
        throw new Error(data.erro || 'Erro ao cadastrar família.')
      }

      setNomePai('')
      setDataNascPai('')
      setNomeMae('')
      setDataNascMae('')
      setEndereco('')
      setTelefone('')
      setFilhos([{ id: Date.now(), nome: '' }])
      setSucesso(true)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="pagina-familia">
      <h1>Cadastrar Família</h1>

      {sucesso && <p className="alerta sucesso">Família cadastrada com sucesso!</p>}
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

        <button type="submit" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar Família'}
        </button>
      </form>
    </div>
  )
}
