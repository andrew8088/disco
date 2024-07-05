type StateConfig<TData, TStateKey extends string> = {
  data: TData;
  initial: NoInfer<TStateKey>;
  states: {
    [key in TStateKey]: {
      on?: {
        [eventName: string]: {
          to?: NoInfer<TStateKey>;
          do?: (data: NoInfer<TData>, payload: never) => void;
        };
      };
    };
  };
};

type StateMachine<TData> = {
  data: TData;
  state: string;
  send: (eventName: string, payload: never) => void;
};

export function createMachine<TData, TStateKey extends string>(
  stateConfig: StateConfig<TData, TStateKey>,
): StateMachine<TData> {
  let currentState = stateConfig.initial;

  return {
    get data() {
      return stateConfig.data;
    },

    get state() {
      return currentState;
    },
    send(eventName: string, payload: never) {
      const currentStateConfig = stateConfig.states[currentState];

      if (currentStateConfig.on?.[eventName]) {
        const eventConfig = currentStateConfig.on[eventName];

        if (eventConfig.do) {
          eventConfig.do(stateConfig.data, payload);
        }
        if (eventConfig.to) {
          currentState = eventConfig.to;
        }
      }
    },
  };
}
