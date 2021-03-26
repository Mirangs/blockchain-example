import { Router } from 'express'
import { Context } from 'utils/Context'

const router = Router()

router.get('/mine-block', (req, res) => {
  const ctx = Context.get(req) as Context
  const blockchain = ctx.blockchain
  const prevBlock = blockchain.getLastBlock()
  let prevProof = 0
  if (!prevBlock) {
    return res.status(404).json({ message: 'Empty blockchain' })
  }

  prevProof = prevBlock.proof
  const currentProof = blockchain.getProofOfWork(prevProof)
  const currentBlock = blockchain.createBlock(currentProof, prevBlock.hash)
  return res.status(201).json({ data: currentBlock })
})

router.get('/chain', (req, res) => {
  const ctx = Context.get(req) as Context
  const blockchain = ctx.blockchain
  return res.status(200).json({ data: blockchain.getChain() })
})

router.get('/is-block-valid/:blockIndex', (req, res) => {
  const ctx = Context.get(req) as Context
  const blockchain = ctx.blockchain
  const { blockIndex } = req.params
  const currentBlock = blockchain.getBlockByIndex(+blockIndex)
  if (!currentBlock) {
    return res
      .status(404)
      .json({ error: `Block with index ${blockIndex} not found` })
  }

  const isBlockValid = blockchain.isBlockValid(currentBlock)
  return res.status(200).json({
    data: isBlockValid,
    message: `Block with index ${blockIndex} is ${
      isBlockValid ? 'valid' : 'invalid'
    }`,
  })
})

export default router
