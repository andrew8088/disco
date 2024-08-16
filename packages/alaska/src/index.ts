type StateConfig<TData, TStateKey extends string, TEvents> = {
  data: TData;
  initial: NoInfer<TStateKey>;
  states: {
    [Key in TStateKey]: {
      on?: {
        [E in keyof TEvents]?: EventConfig<NoInfer<TStateKey>, NoInfer<TData>, TEvents[E]>;
      };
    };
  };
};

type EventConfig<TStateKey, TData, TPayload> = {
  if?: (data: TData) => boolean;
  unless?: (data: TData) => boolean;
  to?: TStateKey;
  do?: [TPayload] extends [never]
    ? (data: TData, payload?: undefined) => void
    : (data: TData, payload: TPayload) => void;
};

type StateMachine<TData, TEvents> = {
  data: TData;
  state: string;
  send: <E extends keyof TEvents>(
    ...args: TEvents[E] extends never ? [E] : [E, TEvents[E]]
  ) => void;
  [Symbol.asyncIterator]: () => AsyncIterator<TData>;
};

export function createMachine<TEvents>() {
  return function <TData, TStateKey extends string>(
    stateConfig: StateConfig<TData, TStateKey, TEvents>,
  ): StateMachine<TData, TEvents> {
    let currentState = stateConfig.initial;
    let currentData = stateConfig.data;
    let resolve: ((value: IteratorResult<TData, never>) => void) | null = null;
    const queue: Array<TData> = [];

    function setUpdate(data: TData) {
      currentData = data;
      if (resolve) {
        resolve({ value: data, done: false });
        resolve = null;
      } else {
        queue.push(data);
      }
    }

    function canRun<K extends TStateKey, TPayload>(eventConfig: EventConfig<K, TData, TPayload>) {
      const ifCondition = eventConfig.if?.(currentData) ?? true;
      const unlessCondition = eventConfig.unless?.(currentData) ?? false;
      return ifCondition && !unlessCondition;
    }

    return {
      get data() {
        return currentData;
      },

      get state() {
        return currentState;
      },
      send<E extends keyof TEvents>(
        ...[eventName, payload]: TEvents[E] extends never ? [E] : [E, TEvents[E]]
      ) {
        const currentStateConfig = stateConfig.states[currentState];

        if (currentStateConfig.on?.[eventName]) {
          const eventConfig = currentStateConfig.on[eventName];

          if (!canRun(eventConfig)) {
            return;
          }

          if (eventConfig.do) {
            const nextData = Object.assign({}, currentData);
            // @ts-expect-error the usual library stuff
            eventConfig.do(nextData, payload);
            // check for changes?
            setUpdate(nextData);
          }
          if (eventConfig.to) {
            currentState = eventConfig.to;
          }
        }
      },

      [Symbol.asyncIterator]: () => ({
        next: () => {
          const value = queue.shift();
          if (value) {
            return Promise.resolve({ value: value, done: false });
          }

          const d = Promise.withResolvers<IteratorResult<TData, never>>();
          resolve = d.resolve;
          return d.promise;
        },
      }),
    };
  };
}
