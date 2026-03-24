import { Router } from 'express'
import { listarFamilias, cadastrarFamilia, deletarFamilia } from '../controllers/familiasController'

const router = Router()

router.get('/', listarFamilias)
router.post('/', cadastrarFamilia)
router.delete('/:id', deletarFamilia)

export default router
