import { asap, isPromiseLike } from "./utils";

type Initializer<T> = (resolve: Resolve, reject: Reject) => void;

type Resolve = (value: any) => void;
type Reject = (reason?: any) => void;

type ThenCb<T> = (value: T) => any;
type CatchCb = (reason?: any) => any;

type AllSettledResult<T> =
  | {
      status: "fulfilled";
      value: T;
    }
  | {
      status: "rejected";
      reason: any;
    };

type Status = "fulfilled" | "rejected" | "pending";

class MyPromise<T> {
  thenCbs: [ThenCb<T> | undefined, CatchCb | undefined, Resolve, Reject][] = [];
  status: Status = "pending";
  value: T | null = null;
  error?: any;

  constructor(initializer: Initializer<T>) {
    try {
      initializer(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  then = <U>(
    thenCb?: (value: T) => U | PromiseLike<U>,
    catchCb?: (reason?: any) => void
  ) => {
    const promise = new MyPromise<U>((resolve, reject) => {
      this.thenCbs.push([thenCb, catchCb, resolve, reject]);
    });

    this.processNextTasks();

    return promise;
  };

  catch = <U>(catchCb?: (reason?: any) => U) => {
    const promise = new MyPromise<U>((resolve, reject) => {
      this.thenCbs.push([undefined, catchCb, resolve, reject]);
    });

    this.processNextTasks();

    return promise;
  };

  static resolve<U>(value: U | PromiseLike<U>) {
    return new MyPromise<U>((resolve) => {
      resolve(value);
    });
  }

  static reject(reason?: any) {
    return new MyPromise((_, reject) => {
      reject(reason);
    });
  }

  private resolve = (value: T | PromiseLike<T>) => {
    if (isPromiseLike(value)) {
      value.then(this.resolve, this.reject);
    } else {
      this.status = "fulfilled";
      this.value = value;

      this.processNextTasks();
    }
  };

  private reject = (reason?: any) => {
    this.status = "rejected";
    this.error = reason;

    this.processNextTasks();
  };

  private processNextTasks = () => {
    asap(() => {
      if (this.status === "pending") {
        return;
      }

      const thenCbs = this.thenCbs;
      this.thenCbs = [];

      thenCbs.forEach(([thenCb, catchCb, resolve, reject]) => {
        try {
          if (this.status === "fulfilled") {
            const value = thenCb ? thenCb(this.value) : this.value;
            resolve(value);
          } else {
            if (catchCb) {
              const value = catchCb(this.error);
              resolve(value);
            } else {
              reject(this.error);
            }
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

// ===========================================================================
const sleep = (ms: number) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const promise = new Promise<number>((resolve) => {
  setTimeout(() => {
    resolve(5);
  }, 1);
})
  .then((value) => {
    console.log("value: ", value);
    return sleep(5000);
  })
  .then((value) => {
    console.log("=========================");
  })
  .catch((error) => {
    console.error("error", error);
  });
