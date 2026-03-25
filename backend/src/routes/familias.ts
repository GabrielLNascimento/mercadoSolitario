import { Router } from 'express'
import { listarFamilias, cadastrarFamilia, buscarFamilia, atualizarFamilia, deletarFamilia } from '../controllers/familiasController'

const router = Router()

router.get('/', listarFamilias)
router.post('/', cadastrarFamilia)
router.get('/:id', buscarFamilia)
router.put('/:id', atualizarFamilia)
router.delete('/:id', deletarFamilia)

export default router
