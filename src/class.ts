export class Deferred {
  key: any;
  promise: any;
  resolve: any;
  reject: any;

  constructor(key: any) {
    this.key = key;
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}
