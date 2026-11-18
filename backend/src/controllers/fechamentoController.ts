import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Horário de Brasília (UTC-3): o mês começa às 03:00 UTC do dia 1
const OFFSET_HORAS = 3

function intervaloDoMes(ano: number, mes: number) {
  const inicio = new Date(Date.UTC(ano, mes - 1, 1, OFFSET_HORAS))
  const fim = new Date(Date.UTC(ano, mes, 1, OFFSET_HORAS))
  return { gte: inicio, lt: fim }
}

function mesAnterior(ano: number, mes: number) {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 }
}

async function totaisDoMes(ano: number, mes: number) {
  const periodo = intervaloDoMes(ano, mes)
  const [entrou, saiu, familias] = await Promise.all([
    prisma.itemEntrada.aggregate({ _sum: { quantidade: true }, where: { entrada: { criadoEm: periodo } } }),
    prisma.itemCompra.aggregate({ _sum: { quantidade: true }, where: { compra: { criadoEm: periodo } } }),
    prisma.compra.findMany({ where: { criadoEm: periodo }, distinct: ['familiaId'], select: { familiaId: true } }),
  ])
  return {
    entrou: entrou._sum.quantidade ?? 0,
    saiu: saiu._sum.quantidade ?? 0,
    familiasAtendidas: familias.length,
  }
}

// GET /api/fechamento?mes=AAAA-MM
export async function fechamentoMensal(req: Request, res: Response) {
  const agora = new Date(Date.now() - OFFSET_HORAS * 3600 * 1000)
  const param = String(req.query.mes ?? '')
  const m = /^(\d{4})-(\d{2})$/.exec(param)
  const ano = m ? Number(m[1]) : agora.getUTCFullYear()
  const mes = m ? Number(m[2]) : agora.getUTCMonth() + 1
  if (mes < 1 || mes > 12) {
    res.status(400).json({ erro: 'Mês inválido. Use AAAA-MM.' })
    return
  }

  const periodo = intervaloDoMes(ano, mes)
  const ant = mesAnterior(ano, mes)

  try {
    const [porProdutoEntrada, porProdutoSaida, compras, qtdEntradas, anterior] = await Promise.all([
      prisma.itemEntrada.groupBy({
        by: ['produtoId'],
        _sum: { quantidade: true },
        where: { entrada: { criadoEm: periodo } },
      }),
      prisma.itemCompra.groupBy({
        by: ['produtoId'],
        _sum: { quantidade: true },
        where: { compra: { criadoEm: periodo } },
      }),
      prisma.compra.findMany({
        where: { criadoEm: periodo },
        select: {
          familiaId: true,
          criadoEm: true,
          familia: { select: { nomePai: true, nomeMae: true } },
          itens: { select: { quantidade: true } },
        },
        orderBy: { criadoEm: 'asc' },
      }),
      prisma.entrada.count({ where: { criadoEm: periodo } }),
      totaisDoMes(ant.ano, ant.mes),
    ])

    const ids = new Set<number>([
      ...porProdutoEntrada.map((p) => p.produtoId),
      ...porProdutoSaida.map((p) => p.produtoId),
    ])
    const produtos = await prisma.produto.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, nome: true, categoria: true, preco: true, quantidade: true },
    })

    const entrouPor = new Map(porProdutoEntrada.map((p) => [p.produtoId, p._sum.quantidade ?? 0]))
    const saiuPor = new Map(porProdutoSaida.map((p) => [p.produtoId, p._sum.quantidade ?? 0]))

    const itens = produtos
      .map((p) => {
        const entrou = entrouPor.get(p.id) ?? 0
        const saiu = saiuPor.get(p.id) ?? 0
        return {
          produtoId: p.id,
          nome: p.nome,
          categoria: p.categoria ?? 'Sem categoria',
          entrou,
          saiu,
          saldo: entrou - saiu,
          valorEntrou: entrou * p.preco,
          valorSaiu: saiu * p.preco,
          estoqueAtual: p.quantidade,
        }
      })
      .sort((a, b) => b.entrou + b.saiu - (a.entrou + a.saiu) || a.nome.localeCompare(b.nome))

    // famílias atendidas no mês
    const familiasMap = new Map<number, { familiaId: number; nome: string; atendimentos: number; itens: number }>()
    for (const c of compras) {
      const f = familiasMap.get(c.familiaId) ?? {
        familiaId: c.familiaId,
        nome: [c.familia.nomeMae, c.familia.nomePai].filter(Boolean).join(' e '),
        atendimentos: 0,
        itens: 0,
      }
      f.atendimentos += 1
      f.itens += c.itens.reduce((s, i) => s + i.quantidade, 0)
      familiasMap.set(c.familiaId, f)
    }
    const familias = [...familiasMap.values()].sort((a, b) => b.itens - a.itens)

    const entrou = itens.reduce((s, i) => s + i.entrou, 0)
    const saiu = itens.reduce((s, i) => s + i.saiu, 0)

    res.json({
      mes: `${ano}-${String(mes).padStart(2, '0')}`,
      totais: {
        entrou,
        saiu,
        saldo: entrou - saiu,
        valorEntrou: itens.reduce((s, i) => s + i.valorEntrou, 0),
        valorSaiu: itens.reduce((s, i) => s + i.valorSaiu, 0),
        familiasAtendidas: familias.length,
        atendimentos: compras.length,
        entradasRegistradas: qtdEntradas,
        produtosMovimentados: itens.length,
      },
      mesAnterior: { mes: `${ant.ano}-${String(ant.mes).padStart(2, '0')}`, ...anterior },
      itens,
      familias,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao gerar o fechamento.' })
  }
}
