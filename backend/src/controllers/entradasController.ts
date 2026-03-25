import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listarEntradas(_req: Request, res: Response) {
  const entradas = await prisma.entrada.findMany({
    include: {
      itens: { include: { produto: true } },
    },
    orderBy: { criadoEm: 'desc' },
  })
  res.json(entradas)
}

export async function criarEntrada(req: Request, res: Response) {
  const { itens } = req.body as { itens: { produtoId: number; quantidade: number }[] }

  if (!itens || itens.length === 0) {
    res.status(400).json({ erro: 'Adicione ao menos um produto.' })
    return
  }

  const [entrada] = await prisma.$transaction([
    prisma.entrada.create({
      data: {
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
        data: { quantidade: { increment: i.quantidade } },
      })
    ),
  ])

  res.status(201).json(entrada)
}

export async function deletarEntrada(req: Request, res: Response) {
  const id = Number(req.params.id)

  const entrada = await prisma.entrada.findUnique({
    where: { id },
    include: { itens: true },
  })

  if (!entrada) {
    res.status(404).json({ erro: 'Entrada não encontrada.' })
    return
  }

  await prisma.$transaction([
    ...entrada.itens.map((item) =>
      prisma.produto.update({
        where: { id: item.produtoId },
        data: { quantidade: { decrement: item.quantidade } },
      })
    ),
    prisma.itemEntrada.deleteMany({ where: { entradaId: id } }),
    prisma.entrada.delete({ where: { id } }),
  ])

  res.status(204).send()
}
