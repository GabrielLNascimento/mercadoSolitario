import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listarFamilias(_req: Request, res: Response) {
  const familias = await prisma.familia.findMany({
    include: { filhos: true },
    orderBy: { criadoEm: 'desc' },
  })
  res.json(familias)
}

export async function cadastrarFamilia(req: Request, res: Response) {
  const { nomePai, dataNascPai, nomeMae, dataNascMae, endereco, telefone, filhos } = req.body

  if (!nomePai || !nomeMae) {
    res.status(400).json({ erro: 'Nome do pai e da mãe são obrigatórios.' })
    return
  }

  const familia = await prisma.familia.create({
    data: {
      nomePai,
      dataNascPai: dataNascPai ? new Date(dataNascPai) : null,
      nomeMae,
      dataNascMae: dataNascMae ? new Date(dataNascMae) : null,
      endereco: endereco || null,
      telefone: telefone || null,
      filhos: {
        create: (filhos as { nome: string }[])
          .filter((f) => f.nome?.trim())
          .map((f) => ({ nome: f.nome.trim() })),
      },
    },
    include: { filhos: true },
  })

  res.status(201).json(familia)
}

export async function buscarFamilia(req: Request, res: Response) {
  const id = Number(req.params.id)
  const familia = await prisma.familia.findUnique({
    where: { id },
    include: { filhos: true },
  })
  if (!familia) {
    res.status(404).json({ erro: 'Família não encontrada.' })
    return
  }
  res.json(familia)
}

export async function atualizarFamilia(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { nomePai, dataNascPai, nomeMae, dataNascMae, endereco, telefone, filhos } = req.body

  if (!nomePai || !nomeMae) {
    res.status(400).json({ erro: 'Nome do pai e da mãe são obrigatórios.' })
    return
  }

  await prisma.filho.deleteMany({ where: { familiaId: id } })

  const familia = await prisma.familia.update({
    where: { id },
    data: {
      nomePai,
      dataNascPai: dataNascPai ? new Date(dataNascPai) : null,
      nomeMae,
      dataNascMae: dataNascMae ? new Date(dataNascMae) : null,
      endereco: endereco || null,
      telefone: telefone || null,
      filhos: {
        create: (filhos as { nome: string }[])
          .filter((f) => f.nome?.trim())
          .map((f) => ({ nome: f.nome.trim() })),
      },
    },
    include: { filhos: true },
  })

  res.json(familia)
}

export async function deletarFamilia(req: Request, res: Response) {
  const id = Number(req.params.id)

  const compras = await prisma.compra.findMany({ where: { familiaId: id } })
  const compraIds = compras.map((c) => c.id)

  await prisma.itemCompra.deleteMany({ where: { compraId: { in: compraIds } } })
  await prisma.compra.deleteMany({ where: { familiaId: id } })
  await prisma.filho.deleteMany({ where: { familiaId: id } })
  await prisma.familia.delete({ where: { id } })

  res.status(204).send()
}
