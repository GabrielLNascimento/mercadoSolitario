import { Router } from 'express'
import { listarCompras, criarCompra, buscarCompra, editarCompra, deletarCompra } from '../controllers/comprasController'

const router = Router({ mergeParams: true })

router.get('/', listarCompras)
router.post('/', criarCompra)
router.get('/:id', buscarCompra)
router.put('/:id', editarCompra)
router.delete('/:id', deletarCompra)

export default router
