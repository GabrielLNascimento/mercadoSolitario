import { Router } from 'express'
import { listarProdutos, cadastrarProduto, buscarProduto, editarProduto, ajustarQuantidade, deletarProduto } from '../controllers/produtosController'

const router = Router()

router.get('/', listarProdutos)
router.post('/', cadastrarProduto)
router.get('/:id', buscarProduto)
router.put('/:id', editarProduto)
router.patch('/:id/quantidade', ajustarQuantidade)
router.delete('/:id', deletarProduto)

export default router
