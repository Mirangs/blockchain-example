import { sha256 as SHA256 } from 'sha.js'
import log4js from 'log4js'

const log = log4js.getLogger('app')

export interface Block {
  index: number
  proof: number
  prevHash: string
  hash: string
  timestamp: Date
}

export type BlockChain = Block[]

const LEADING_ZEROES_HASH_AMOUNT = 4

export class Blockchain {
  private chain: BlockChain = []

  constructor() {
    const genesisBlock: Partial<Block> = {
      index: 1,
      prevHash: '0'.repeat(64),
      timestamp: new Date(),
      proof: 1,
    }
    genesisBlock.hash = this.hash(genesisBlock as Block)
    this.chain.push(genesisBlock as Block)
  }

  createBlock = (proof: number, prevHash: string): Block => {
    const block: Partial<Block> = {
      index: this.chain.length + 1,
      proof,
      prevHash,
      timestamp: new Date(),
    }
    block.hash = this.hash(block as Block)
    this.chain.push(block as Block)
    return block as Block
  }

  getPrevBlock = (block: Block): Block => this.chain[block.index - 2]
  getLastBlock = (): Block => this.chain[this.chain.length - 1]

  getProofOfWork = (prevProof: number): number => {
    let newProof = 1
    let isProofValid = false

    while (!isProofValid) {
      const tmpHash = this.hashProof(prevProof, newProof)
      isProofValid =
        tmpHash.slice(0, 4) === '0'.repeat(LEADING_ZEROES_HASH_AMOUNT)
      !isProofValid && (newProof += 1)
    }

    return newProof
  }

  hash = (block: Block): string =>
    new SHA256().update(JSON.stringify(block)).digest('hex')

  hashProof = (prevProof: number, currentProof: number): string =>
    new SHA256()
      .update((currentProof ** 2 - prevProof ** 2).toString())
      .digest('hex')

  isChainValid = (chain: BlockChain): boolean => {
    let prevBlock = chain[0]
    let blockIndex = 1
    while (blockIndex < chain.length) {
      const currentBlock = chain[blockIndex]
      if (currentBlock.prevHash !== prevBlock.hash) {
        return false
      }
      const prevProof = prevBlock.proof
      const currentProof = currentBlock.proof
      if (
        this.hashProof(prevProof, currentProof) !==
        '0'.repeat(LEADING_ZEROES_HASH_AMOUNT)
      ) {
        return false
      }

      prevBlock = currentBlock
      blockIndex += 1
    }

    return true
  }

  getBlockByIndex = (blockIndex: number): Block | undefined =>
    this.chain.find(({ index }) => index === blockIndex)

  isBlockValid = (block: Block): boolean => {
    if (block.index === 1) {
      return true
    }
    const prevBlock = this.getPrevBlock(block)
    if (!prevBlock) {
      log.error(`Cannot find prev block for block with index ${block.index}`)
      return false
    }

    if (prevBlock.hash !== block.prevHash) {
      log.error(
        `Prev hash for block ${prevBlock.index} does not match hash for block ${block.index}`
      )
      return false
    }

    if (this.getProofOfWork(prevBlock.proof) !== block.proof) {
      return false
    }

    return true
  }

  getChain = (): BlockChain => this.chain
}
