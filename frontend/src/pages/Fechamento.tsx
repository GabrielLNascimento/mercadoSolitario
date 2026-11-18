import { useEffect, useMemo, useState } from 'react'
import './Fechamento.css'

interface ItemFechamento {
  produtoId: number
  nome: string
  categoria: string
  entrou: number
  saiu: number
  saldo: number
  valorEntrou: number
  valorSaiu: number
  estoqueAtual: number
}

interface FamiliaAtendida {
  familiaId: number
  nome: string
  atendimentos: number
  itens: number
}

interface DadosFechamento {
  mes: string
  totais: {
    entrou: number
    saiu: number
    saldo: number
    valorEntrou: number
    valorSaiu: number
    familiasAtendidas: number
    atendimentos: number
    entradasRegistradas: number
    produtosMovimentados: number
  }
  mesAnterior: { mes: string; entrou: number; saiu: number; familiasAtendidas: number }
  itens: ItemFechamento[]
  familias: FamiliaAtendida[]
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function deslocarMes(mes: string, delta: number) {
  const [a, m] = mes.split('-').map(Number)
  const d = new Date(a, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nomeDoMes(mes: string) {
  const [a, m] = mes.split('-').map(Number)
  return `${MESES[m - 1]} de ${a}`
}

const num = (n: number) => n.toLocaleString('pt-BR')
const real = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0 && atual === 0) return <span className="fech-var neutra">sem movimento no mês anterior</span>
  if (anterior === 0) return <span className="fech-var neutra">sem dados no mês anterior</span>
  const pct = Math.round(((atual - anterior) / anterior) * 100)
  const classe = pct > 0 ? 'sobe' : pct < 0 ? 'desce' : 'neutra'
  const seta = pct > 0 ? '▲' : pct < 0 ? '▼' : '='
  return (
    <span className={`fech-var ${classe}`}>
      {seta} {Math.abs(pct)}% vs. mês anterior ({num(anterior)})
    </span>
  )
}

export default function Fechamento() {
  const API_URL = import.meta.env.VITE_API_URL ?? ''
  const [mes, setMes] = useState(mesAtual())
  const [dados, setDados] = useState<DadosFechamento | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<'mov' | 'entrou' | 'saiu' | 'nome'>('mov')

  function trocarMes(novo: string) {
    if (novo === mes) return
    setCarregando(true)
    setErro('')
    setMes(novo)
  }

  useEffect(() => {
    fetch(`${API_URL}/api/fechamento?mes=${mes}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: DadosFechamento) => setDados(data))
      .catch(() => {
        setDados(null)
        setErro('Não foi possível carregar o fechamento.')
      })
      .finally(() => setCarregando(false))
  }, [API_URL, mes])

  const itensFiltrados = useMemo(() => {
    if (!dados) return []
    const termo = busca.trim().toLowerCase()
    const lista = dados.itens.filter(
      (i) => !termo || i.nome.toLowerCase().includes(termo) || i.categoria.toLowerCase().includes(termo),
    )
    const cmp = {
      mov: (a: ItemFechamento, b: ItemFechamento) => b.entrou + b.saiu - (a.entrou + a.saiu),
      entrou: (a: ItemFechamento, b: ItemFechamento) => b.entrou - a.entrou,
      saiu: (a: ItemFechamento, b: ItemFechamento) => b.saiu - a.saiu,
      nome: (a: ItemFechamento, b: ItemFechamento) => a.nome.localeCompare(b.nome),
    }[ordem]
    return [...lista].sort((a, b) => cmp(a, b) || a.nome.localeCompare(b.nome))
  }, [dados, busca, ordem])

  const categorias = useMemo(() => {
    if (!dados) return []
    const mapa = new Map<string, { categoria: string; entrou: number; saiu: number }>()
    for (const i of dados.itens) {
      const c = mapa.get(i.categoria) ?? { categoria: i.categoria, entrou: 0, saiu: 0 }
      c.entrou += i.entrou
      c.saiu += i.saiu
      mapa.set(i.categoria, c)
    }
    return [...mapa.values()].sort((a, b) => b.entrou + b.saiu - (a.entrou + a.saiu))
  }, [dados])

  const maxCategoria = Math.max(1, ...categorias.map((c) => Math.max(c.entrou, c.saiu)))
  const somaFiltrada = itensFiltrados.reduce(
    (acc, i) => ({ entrou: acc.entrou + i.entrou, saiu: acc.saiu + i.saiu }),
    { entrou: 0, saiu: 0 },
  )

  function exportarCsv() {
    if (!dados) return
    const linhas = [
      ['Produto', 'Categoria', 'Entrou', 'Saiu', 'Saldo do mês', 'Estoque atual'],
      ...dados.itens.map((i) => [i.nome, i.categoria, i.entrou, i.saiu, i.saldo, i.estoqueAtual]),
      [],
      ['TOTAL', '', dados.totais.entrou, dados.totais.saiu, dados.totais.saldo, ''],
      ['Famílias atendidas', dados.totais.familiasAtendidas],
      ['Atendimentos', dados.totais.atendimentos],
    ]
    const csv = linhas
      .map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fechamento-${dados.mes}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const t = dados?.totais
  const totalMov = t ? t.entrou + t.saiu : 0
  const futuro = mes >= mesAtual()

  return (
    <div className="pagina-fechamento">
      <div className="fech-header">
        <div>
          <h1>Fechamento mensal</h1>
          <p className="fech-sub">Entradas, saídas e famílias atendidas no mês</p>
        </div>
        <div className="fech-acoes nao-imprimir">
          <button className="fech-btn-sec" onClick={exportarCsv} disabled={!dados}>Exportar planilha</button>
          <button className="fech-btn" onClick={() => window.print()} disabled={!dados}>Imprimir</button>
        </div>
      </div>

      <div className="fech-mes">
        <button className="fech-seta nao-imprimir" onClick={() => trocarMes(deslocarMes(mes, -1))} aria-label="Mês anterior">‹</button>
        <div className="fech-mes-nome">
          <span>{nomeDoMes(mes)}</span>
          <input
            type="month"
            className="nao-imprimir"
            value={mes}
            max={mesAtual()}
            onChange={(e) => e.target.value && trocarMes(e.target.value)}
          />
        </div>
        <button className="fech-seta nao-imprimir" onClick={() => trocarMes(deslocarMes(mes, 1))} disabled={futuro} aria-label="Próximo mês">›</button>
      </div>

      {carregando && <p className="info">Carregando...</p>}
      {erro && <p className="fech-erro">{erro}</p>}

      {!carregando && dados && t && (
        <>
          <div className="fech-cards">
            <div className="fech-card entrou">
              <span className="fech-card-label">Entrou no mês</span>
              <span className="fech-card-num">+{num(t.entrou)}</span>
              <span className="fech-card-det">unidades · {t.entradasRegistradas} entrada(s) · {real(t.valorEntrou)}</span>
              <Variacao atual={t.entrou} anterior={dados.mesAnterior.entrou} />
            </div>
            <div className="fech-card saiu">
              <span className="fech-card-label">Saiu no mês</span>
              <span className="fech-card-num">−{num(t.saiu)}</span>
              <span className="fech-card-det">unidades entregues · {real(t.valorSaiu)}</span>
              <Variacao atual={t.saiu} anterior={dados.mesAnterior.saiu} />
            </div>
            <div className="fech-card saldo">
              <span className="fech-card-label">Saldo do mês</span>
              <span className="fech-card-num">{t.saldo > 0 ? '+' : ''}{num(t.saldo)}</span>
              <span className="fech-card-det">entrou − saiu · {t.produtosMovimentados} produto(s) movimentado(s)</span>
            </div>
            <div className="fech-card familias">
              <span className="fech-card-label">Famílias atendidas</span>
              <span className="fech-card-num">{num(t.familiasAtendidas)}</span>
              <span className="fech-card-det">{t.atendimentos} atendimento(s) no mês</span>
              <Variacao atual={t.familiasAtendidas} anterior={dados.mesAnterior.familiasAtendidas} />
            </div>
          </div>

          {totalMov === 0 ? (
            <div className="fech-vazio">Nenhuma entrada ou saída registrada em {nomeDoMes(mes).toLowerCase()}.</div>
          ) : (
            <>
              <section className="fech-bloco">
                <h2>Entrou × saiu</h2>
                <div className="fech-barra">
                  <div className="fech-barra-entrou" style={{ width: `${(t.entrou / totalMov) * 100}%` }}>
                    {t.entrou > 0 && <span>{num(t.entrou)}</span>}
                  </div>
                  <div className="fech-barra-saiu" style={{ width: `${(t.saiu / totalMov) * 100}%` }}>
                    {t.saiu > 0 && <span>{num(t.saiu)}</span>}
                  </div>
                </div>
                <div className="fech-legenda">
                  <span><i className="ponto entrou" /> Entrou</span>
                  <span><i className="ponto saiu" /> Saiu</span>
                </div>
              </section>

              {categorias.length > 1 && (
                <section className="fech-bloco">
                  <h2>Por categoria</h2>
                  <div className="fech-cats">
                    {categorias.map((c) => (
                      <div key={c.categoria} className="fech-cat">
                        <span className="fech-cat-nome">{c.categoria}</span>
                        <div className="fech-cat-barras">
                          <div className="fech-cat-linha">
                            <div className="fech-cat-b entrou" style={{ width: `${(c.entrou / maxCategoria) * 100}%` }} />
                            <span>{c.entrou ? `+${num(c.entrou)}` : 0}</span>
                          </div>
                          <div className="fech-cat-linha">
                            <div className="fech-cat-b saiu" style={{ width: `${(c.saiu / maxCategoria) * 100}%` }} />
                            <span>{c.saiu ? `−${num(c.saiu)}` : 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="fech-bloco">
                <div className="fech-bloco-topo">
                  <h2>Por item</h2>
                  <div className="fech-filtros nao-imprimir">
                    <input
                      type="text"
                      placeholder="Buscar produto ou categoria..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                    <select value={ordem} onChange={(e) => setOrdem(e.target.value as typeof ordem)}>
                      <option value="mov">Mais movimentados</option>
                      <option value="entrou">Mais entrou</option>
                      <option value="saiu">Mais saiu</option>
                      <option value="nome">Nome (A–Z)</option>
                    </select>
                  </div>
                </div>
                <div className="fech-tabela-wrap">
                  <table className="fech-tabela">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th className="num">Entrou</th>
                        <th className="num">Saiu</th>
                        <th className="num">Saldo do mês</th>
                        <th className="num">Estoque atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensFiltrados.map((i) => (
                        <tr key={i.produtoId}>
                          <td>
                            <span className="fech-prod">{i.nome}</span>
                            <span className="fech-prod-cat">{i.categoria}</span>
                          </td>
                          <td className="num entrou">{i.entrou ? `+${num(i.entrou)}` : '—'}</td>
                          <td className="num saiu">{i.saiu ? `−${num(i.saiu)}` : '—'}</td>
                          <td className={`num ${i.saldo >= 0 ? 'pos' : 'neg'}`}>{i.saldo > 0 ? '+' : ''}{num(i.saldo)}</td>
                          <td className="num">{num(i.estoqueAtual)}</td>
                        </tr>
                      ))}
                      {itensFiltrados.length === 0 && (
                        <tr><td colSpan={5} className="fech-nenhum">Nenhum produto encontrado.</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total{busca ? ' (filtrado)' : ''}</td>
                        <td className="num entrou">+{num(somaFiltrada.entrou)}</td>
                        <td className="num saiu">−{num(somaFiltrada.saiu)}</td>
                        <td className="num">{num(somaFiltrada.entrou - somaFiltrada.saiu)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {dados.familias.length > 0 && (
                <section className="fech-bloco">
                  <h2>Famílias atendidas ({dados.familias.length})</h2>
                  <div className="fech-tabela-wrap">
                    <table className="fech-tabela">
                      <thead>
                        <tr>
                          <th>Família</th>
                          <th className="num">Atendimentos</th>
                          <th className="num">Itens recebidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.familias.map((f) => (
                          <tr key={f.familiaId}>
                            <td>{f.nome || `Família #${f.familiaId}`}</td>
                            <td className="num">{f.atendimentos}</td>
                            <td className="num saiu">{num(f.itens)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
          <p className="fech-nota">
            Soma das entradas registradas na página Entradas e das compras das famílias. Ajustes feitos com os botões + / − do
            Estoque não entram no fechamento.
          </p>
        </>
      )}
    </div>
  )
}
