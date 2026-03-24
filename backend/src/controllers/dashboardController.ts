import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function resumo(_req: Request, res: Response) {
  const [totalProdutos, totalFamilias] = await Promise.all([
    prisma.produto.count(),
    prisma.familia.count(),
  ])

  res.json({ totalProdutos, totalFamilias })
}
