import { Router } from 'express'
import { listarEntradas, criarEntrada, deletarEntrada } from '../controllers/entradasController'

const router = Router()

router.get('/', listarEntradas)
router.post('/', criarEntrada)
router.delete('/:id', deletarEntrada)

export default router
