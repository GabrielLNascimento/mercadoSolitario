import { Router } from 'express'
import { fechamentoMensal } from '../controllers/fechamentoController'

const router = Router()

router.get('/', fechamentoMensal)

export default router
