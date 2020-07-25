export class ContextEventEmitter<T extends { 
  [key: string]: {
    arguments: any[],
    return: any
  } 
} = {}> {
  private readonly stacks: Map<keyof T, (...args: T[keyof T]['arguments']) => T[keyof T]['return']> = new Map();

  public on<M extends keyof T>(name: M, callback: (...args: T[M]['arguments']) => T[M]['return']) {
    this.stacks.set(name, callback);
    return () => this.stacks.delete(name);
  }

  public trigger<M extends keyof T>(name: M, ...args: T[M]['arguments']) {
    if (this.stacks.has(name)) {
      const callback = this.stacks.get(name);
      return callback(...args);
    }
  }

  public has<M extends keyof T>(name: M) {
    return this.stacks.has(name);
  }
}