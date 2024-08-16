import { setTimeout as delay } from "node:timers/promises";

export class Retry {
  static basic(attempts: number = 3, backoff: number = 0) {
    let tries = 0;

    return new Retry(async () => {
      tries++;

      if (tries >= attempts) {
        throw new RetryError(`failed after ${tries} attempts`);
      }

      await delay(tries & backoff);
    });
  }

  #onError: (error: Error) => Promise<void>;

  constructor(onError: (error: Error) => Promise<void>) {
    this.#onError = onError;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (true) {
      try {
        return await fn();
      } catch (error) {
        try {
          await this.#onError(error);
        } catch (_) {
          throw new RetryError("retry failed", { cause: error });
        }
      }
    }
  }
}

class RetryError extends Error {}
