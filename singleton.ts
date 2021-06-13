console.log("hello");

interface BaseRecord {
  id: string;
}

interface Pokemon extends BaseRecord {
  name: string
}


interface Database<T extends BaseRecord> {
  get(id: string): T | undefined;
  set(newValue: T): void;
}

module SingletonHider{
  class InMemoryDatabase<T extends BaseRecord> implements Database<T> {
    private db: Record<string, T> = {};

    public set(newValue: T): void {
      this.db[newValue.id] = newValue;
    }
    public get(id: string): T | undefined {
      return this.db[id];
    }
  }
  export class SingletonDBConstructor<T extends BaseRecord> {
    private instance: InMemoryDatabase<T> = new InMemoryDatabase<T>();
    public getDb(): InMemoryDatabase<T> {
      return this.instance;
    }
  }
}

const singletonProvider = new SingletonHider.SingletonDBConstructor<Pokemon>();
const singletonDb = singletonProvider.getDb();

singletonDb.set({
  id: "1",
  name: "pika"
});

console.log(singletonDb);
console.log(singletonProvider.getDb());
