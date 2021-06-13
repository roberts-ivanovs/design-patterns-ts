interface BeforeSetEvent<T> {
  value: T;
  newValue: T;
}

interface AfterSetEvent<T> {
  value: T;
}

interface BaseRecord {
  id: string;
}

interface Pokemon extends BaseRecord {
  name: string;
}

interface Database<T extends BaseRecord> {
  get(id: string): T | undefined;
  set(newValue: T): void;

  selectRecord(scoreStrategy: (item: T) => number): T | undefined;
}

module SingletonHider {
  class InMemoryDatabase<T extends BaseRecord> implements Database<T> {
    private db: Record<string, T> = {};

    public set(newValue: T): void {
      this.db[newValue.id] = newValue;
    }
    public get(id: string): T | undefined {
      return this.db[id];
    }
    public selectRecord(scoreStrategy: (item: T) => number): T | undefined {
      const found: {
        max: number;
        item: T | undefined;
      } = {
        max: 0,
        item: undefined,
      };

      Object.values(this.db).reduce((f, item) => {
        const score = scoreStrategy(item);
        if (score > f.max) {
          f.max = score;
          f.item = item;
        }
        return f;
      }, found)
      return found.item;
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
  id: '1',
  name: 'pika',
});

singletonDb.set({
  id: '2',
  name: 'Ketchup',
});

const largestId = singletonDb.selectRecord((item) => {
  return Number(item.id)
});

console.log(largestId);
