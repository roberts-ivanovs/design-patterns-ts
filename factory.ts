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

function createDatabase<T extends BaseRecord>() {
  class InMemoryDatabase implements Database<T> {
    private db: Record<string, T> = {};
    public set(newValue: T): void {
      this.db[newValue.id] = newValue;
    }
    public get(id: string): T | undefined {
      return this.db[id];
    }
  }

  return InMemoryDatabase;
}

const dbFactory = createDatabase<Pokemon>();
const dbInstance = new dbFactory();

console.log(dbInstance);
dbInstance.set({
  id: "1",
  name: "pika"
});

console.log(dbInstance);
