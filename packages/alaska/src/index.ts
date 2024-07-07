type StateConfig<TData, TStateKey extends string, TEvents> = {
  data: TData;
  initial: NoInfer<TStateKey>;
  states: {
    [Key in TStateKey]: {
      on?: {
        [E in keyof TEvents]?: {
          if?: (data: NoInfer<TData>) => boolean;
          unless?: (data: NoInfer<TData>) => boolean;
          to?: NoInfer<TStateKey>;
          do?: TEvents[E] extends never
            ? (data: NoInfer<TData>) => void
            : (data: NoInfer<TData>, payload: TEvents[E]) => void;
        };
      };
    };
  };
};

type StateMachine<TData, TEvents> = {
  data: TData;
  state: string;
  send: <E extends keyof TEvents>(...args: TEvents[E] extends never ? [E] : [E, TEvents[E]]) => void;
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

    return {
      get data() {
        return currentData;
      },

      get state() {
        return currentState;
      },
      send<E extends keyof TEvents>(...[eventName, payload]: TEvents[E] extends never ? [E] : [E, TEvents[E]]) {
        const currentStateConfig = stateConfig.states[currentState];

        if (currentStateConfig.on?.[eventName]) {
          const eventConfig = currentStateConfig.on[eventName];

          if (eventConfig.do) {
            if (eventConfig.if && !eventConfig.if(currentData)) {
              return;
            }

            const nextData = Object.assign({}, currentData);
            eventConfig.do(nextData, payload as never);
            // check for changes?
            setUpdate(nextData);
          }
          if (eventConfig.to) {
            if (eventConfig.if && !eventConfig.if(currentData)) {
              return;
            }
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
