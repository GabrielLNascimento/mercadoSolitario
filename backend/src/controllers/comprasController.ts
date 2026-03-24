import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listarCompras(req: Request, res: Response) {
  const familiaId = Number(req.params.familiaId)

  const compras = await prisma.compra.findMany({
    where: { familiaId },
    include: {
      itens: {
        include: { produto: true },
      },
    },
    orderBy: { criadoEm: 'desc' },
  })

  res.json(compras)
}

export async function criarCompra(req: Request, res: Response) {
  const familiaId = Number(req.params.familiaId)
  const { itens } = req.body as { itens: { produtoId: number; quantidade: number }[] }

  if (!itens || itens.length === 0) {
    res.status(400).json({ erro: 'Adicione ao menos um produto.' })
    return
  }

  const [compra] = await prisma.$transaction([
    prisma.compra.create({
      data: {
        familiaId,
        itens: {
          create: itens.map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
          })),
        },
      },
      include: {
        itens: { include: { produto: true } },
      },
    }),
    ...itens.map((i) =>
      prisma.produto.update({
        where: { id: i.produtoId },
        data: { quantidade: { decrement: i.quantidade } },
      })
    ),
  ])

  res.status(201).json(compra)
}

export async function buscarCompra(req: Request, res: Response) {
  const id = Number(req.params.id)

  const compra = await prisma.compra.findUnique({
    where: { id },
    include: { itens: { include: { produto: true } } },
  })

  if (!compra) {
    res.status(404).json({ erro: 'Compra não encontrada.' })
    return
  }

  res.json(compra)
}

export async function editarCompra(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { itens } = req.body as { itens: { produtoId: number; quantidade: number }[] }

  if (!itens || itens.length === 0) {
    res.status(400).json({ erro: 'Adicione ao menos um produto.' })
    return
  }

  const compraAtual = await prisma.compra.findUnique({
    where: { id },
    include: { itens: true },
  })

  if (!compraAtual) {
    res.status(404).json({ erro: 'Compra não encontrada.' })
    return
  }

  const compra = await prisma.$transaction(async (tx) => {
    // Devolve estoque dos itens antigos
    for (const item of compraAtual.itens) {
      await tx.produto.update({
        where: { id: item.produtoId },
        data: { quantidade: { increment: item.quantidade } },
      })
    }

    // Remove itens antigos e cria novos
    await tx.itemCompra.deleteMany({ where: { compraId: id } })

    // Desconta estoque dos novos itens
    for (const item of itens) {
      await tx.produto.update({
        where: { id: item.produtoId },
        data: { quantidade: { decrement: item.quantidade } },
      })
    }

    return tx.compra.update({
      where: { id },
      data: {
        itens: {
          create: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        },
      },
      include: { itens: { include: { produto: true } } },
    })
  })

  res.json(compra)
}

export async function deletarCompra(req: Request, res: Response) {
  const id = Number(req.params.id)

  const compra = await prisma.compra.findUnique({
    where: { id },
    include: { itens: true },
  })

  if (!compra) {
    res.status(404).json({ erro: 'Compra não encontrada.' })
    return
  }

  await prisma.$transaction([
    ...compra.itens.map((item) =>
      prisma.produto.update({
        where: { id: item.produtoId },
        data: { quantidade: { increment: item.quantidade } },
      })
    ),
    prisma.itemCompra.deleteMany({ where: { compraId: id } }),
    prisma.compra.delete({ where: { id } }),
  ])

  res.status(204).send()
}
