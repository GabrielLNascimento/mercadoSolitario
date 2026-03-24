import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listarProdutos(_req: Request, res: Response) {
  const produtos = await prisma.produto.findMany({ orderBy: { criadoEm: 'desc' } })
  res.json(produtos)
}

export async function cadastrarProduto(req: Request, res: Response) {
  const { nome, preco, categoria } = req.body

  if (!nome || preco == null) {
    res.status(400).json({ erro: 'Nome e preço são obrigatórios.' })
    return
  }

  const produto = await prisma.produto.create({
    data: { nome, quantidade: 0, preco: Number(preco), categoria },
  })

  res.status(201).json(produto)
}

export async function ajustarQuantidade(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { operacao } = req.body as { operacao: 'incrementar' | 'decrementar' }

  const produto = await prisma.produto.findUnique({ where: { id } })
  if (!produto) {
    res.status(404).json({ erro: 'Produto não encontrado.' })
    return
  }

  if (operacao === 'decrementar' && produto.quantidade <= 0) {
    res.status(400).json({ erro: 'Quantidade já está em zero.' })
    return
  }

  const atualizado = await prisma.produto.update({
    where: { id },
    data: { quantidade: operacao === 'incrementar' ? { increment: 1 } : { decrement: 1 } },
  })

  res.json(atualizado)
}

export async function buscarProduto(req: Request, res: Response) {
  const id = Number(req.params.id)
  const produto = await prisma.produto.findUnique({ where: { id } })
  if (!produto) {
    res.status(404).json({ erro: 'Produto não encontrado.' })
    return
  }
  res.json(produto)
}

export async function editarProduto(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { nome, preco, categoria } = req.body

  if (!nome || preco == null) {
    res.status(400).json({ erro: 'Nome e preço são obrigatórios.' })
    return
  }

  const produto = await prisma.produto.update({
    where: { id },
    data: { nome, preco: Number(preco), categoria },
  })

  res.json(produto)
}

export async function deletarProduto(req: Request, res: Response) {
  const id = Number(req.params.id)
  await prisma.produto.delete({ where: { id } })
  res.status(204).send()
}
