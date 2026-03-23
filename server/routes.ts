import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.send('Get all users')
})

router.get('/:id', (req, res) => {
  res.send(`Get user ${req.params.id}`)
})

export default router
