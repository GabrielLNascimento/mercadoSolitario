import express from 'express'
import cors from 'cors'
import produtosRouter from './routes/produtos'
import familiasRouter from './routes/familias'
import comprasRouter from './routes/compras'
import dashboardRouter from './routes/dashboard'
import entradasRouter from './routes/entradas'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/produtos', produtosRouter)
app.use('/api/familias', familiasRouter)
app.use('/api/familias/:familiaId/compras', comprasRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/entradas', entradasRouter)

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3333
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

export default app
