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
    initializer(this.resolve, this.reject);
  }

  then = <U>(thenCb: (value: T) => U, catchCb?: (reason?: any) => void) => {
    const promise = new MyPromise<U>((resolve, reject) => {
      this.thenCbs.push([thenCb, catchCb, resolve, reject]);
    });

    return promise;
  };

  catch = <U>(catchCb: (reason?: any) => void) => {
    const promise = new MyPromise<U>((resolve, reject) => {
      this.thenCbs.push([undefined, catchCb, resolve, reject]);
    });

    return promise;
  };

  private resolve = (value: T) => {
    this.thenCbs.forEach((cb) => cb(value));
  };

  private reject = (reason?: any) => {
    this.thenCbs.forEach((cb) => cb(reason));
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
