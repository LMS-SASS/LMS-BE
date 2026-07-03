// Jest test-only stub. @mikro-orm/postgresql ships ESM-only, which ts-jest's
// CommonJS transform can't load from node_modules. Unit tests mock EntityManager
// entirely, so only the class reference needed for Nest's DI type reflection matters.
export class EntityManager {}
export class EntitySchema {
  constructor() {}
}
