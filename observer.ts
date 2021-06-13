type Listener<EventType> = (ev: EventType) => void;

function createObserver<EventType>(): {
  subscribe: (listener: Listener<EventType>) => () => void;
  publish: (event: EventType) => void;
} {
  let listeners: Array<Listener<EventType>> = [];

  return {
    subscribe: (listener: Listener<EventType>): (() => void) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    publish: (event: EventType): void => {
      listeners.forEach((l) => l(event));
    },
  };
}

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

  onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
  onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void;
}

module SingletonHider {
  class InMemoryDatabase<T extends BaseRecord> implements Database<T> {
    private db: Record<string, T> = {};
    private beforeAddListeners = createObserver<BeforeSetEvent<T>>();
    private afterAddListeners = createObserver<AfterSetEvent<T>>();

    public set(newValue: T): void {
      this.beforeAddListeners.publish({
        newValue,
        value: this.db[newValue.id],
      });
      this.db[newValue.id] = newValue;
      this.afterAddListeners.publish({
        value: newValue,
      });
    }
    public onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void {
      return this.beforeAddListeners.subscribe(listener);
    }
    public onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void {
      return this.afterAddListeners.subscribe(listener);
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
  id: '1',
  name: 'pika',
});


const unsubscribe = singletonDb.onBeforeAdd(({
  value
}) => {
  console.log("before add", value);
})
unsubscribe();
singletonDb.onAfterAdd(({
  value
}) => {
  console.log("after add", value);
})

singletonDb.set({
  id: '2',
  name: 'Ketchup',
});
