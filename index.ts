type Initializer<T> = (
  resolve: () => void,
  reject: (reason?: any) => void
) => void;

class MyPromise {
  constructor(initializer) {}

  then = () => {};

  catch = () => {};

  private resolver = () => {};

  private reject = () => {};
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("asdf");
  }, 500);
})
  .then((value) => {
    console.log(value);
  })
  .catch((error) => {
    console.error(error);
  });
