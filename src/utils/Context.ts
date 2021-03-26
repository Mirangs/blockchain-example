import { Request } from 'express'
import { Blockchain } from 'creating-blockchain/Blockchain'

export class Context {
  static _bindings = new WeakMap<Request, Context>()

  public blockchain = new Blockchain()

  static bind(req: Request): void {
    const ctx = new Context()
    Context._bindings.set(req, ctx)
  }

  static get(req: Request): Context | null {
    return Context._bindings.get(req) || null
  }
}
