import { Router } from 'express'
import { resumo } from '../controllers/dashboardController'

const router = Router()

router.get('/', resumo)

export default router
