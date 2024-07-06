type StateConfig<TData, TStateKey extends string, TEvents> = {
  data: TData;
  initial: NoInfer<TStateKey>;
  states: {
    [key in TStateKey]: {
      on?: {
        [eventName in keyof TEvents]?: {
          to?: NoInfer<TStateKey>;
          do?: (data: NoInfer<TData>, payload: TEvents[eventName]) => void;
        };
      };
    };
  };
};

type StateMachine<TData, TEvents> = {
  data: TData;
  state: string;
  send: <K extends keyof TEvents>(eventName: K, payload: TEvents[K]) => void;
};

export function createMachine<TEvents>() {
  return <TData, TStateKey extends string>(stateConfig: StateConfig<TData, TStateKey, TEvents>) =>
    _createMachine(stateConfig);
}

function _createMachine<TData, TStateKey extends string, TEvents>(
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
    send<K extends keyof TEvents>(eventName: K, payload: TEvents[K]) {
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
