type StateConfig<TData, TStateKey extends string, TEvents> = {
  data: TData;
  initial: NoInfer<TStateKey>;
  states: {
    [Key in TStateKey]: {
      on?: {
        [E in keyof TEvents]?: {
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
};

export function createMachine<TEvents>() {
  return function <TData, TStateKey extends string>(
    stateConfig: StateConfig<TData, TStateKey, TEvents>,
  ): StateMachine<TData, TEvents> {
    let currentState = stateConfig.initial;

    return {
      get data() {
        return stateConfig.data;
      },

      get state() {
        return currentState;
      },
      send<E extends keyof TEvents>(...[eventName, payload]: TEvents[E] extends never ? [E] : [E, TEvents[E]]) {
        const currentStateConfig = stateConfig.states[currentState];

        if (currentStateConfig.on?.[eventName]) {
          const eventConfig = currentStateConfig.on[eventName];

          if (eventConfig.do) {
            eventConfig.do(stateConfig.data, payload as never);
          }
          if (eventConfig.to) {
            currentState = eventConfig.to;
          }
        }
      },
    };
  };
}
