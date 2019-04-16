/**
 * ## 规范地址
 * [英文原文](https://promisesaplus.com/)
 * [译文原文](http://www.ituring.com.cn/article/66566)
 */

enum State { PENDING, RESOLVED, REJECTED }

class MyPromise<Value> {
    private state: State = State.PENDING;
    private value: Value = null;
    private resolvedCallbacks: any[] = [];
    private rejectedCallbacks: any[] = [];
    private hasCalledResolution: boolean = false;

    constructor(fn: (res, rej) => any) {
        try {
            fn(this.resolve, this.reject)
        } catch (e) {
            this.reject(e)
        }
    }

    resolve = (value: Value) => {
        setTimeout(() => {
            if (this.state === State.PENDING) {
              this.state = State.RESOLVED;
              this.value = value;
              this.resolvedCallbacks.map(cb => cb(this.value));
            }
        }, 0);
    }

    reject = (value: Value) => {
        setTimeout(() => {
            if (this.state === State.PENDING) {
                this.state = State.REJECTED;
                this.value = value;
                this.rejectedCallbacks.map(cb => cb(this.value))
            }
        }, 0);
    }

    then = (onFulfilled?: any, onRejected?: any) => {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : v => { throw(v); };

        let newPromise: MyPromise<any>;

        if (this.state === State.PENDING) {
            newPromise = new MyPromise((resolve, reject) => {
                this.resolvedCallbacks.push(() => {
                    try {
                        const x = onFulfilled(this.value);
                        this.resolutionProcedure(newPromise, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });

                this.rejectedCallbacks.push(() => {
                    try {
                        const x = onRejected(this.value);
                        this.resolutionProcedure(newPromise, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            });
        } else {
            newPromise = new MyPromise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const x = this.state === State.RESOLVED 
                            ? onFulfilled(this.value)
                            : onRejected(this.value);
                        this.resolutionProcedure(newPromise, x, resolve, reject)
                    } catch (e) {
                        reject(e);
                    }
                })
            });
        }
        return newPromise;
    }

    /**
     * ## Promise 解决过程
     * 
     * ### x 与 promise 相等
     * 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
     * 
     * ### x 为 Promise
     * 如果 x 为 Promise ，则使 promise 接受 x 的状态
     * - 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
     * - 如果 x 处于执行态，用相同的值执行 promise
     * - 如果 x 处于拒绝态，用相同的据因拒绝 promise
     * 
     * ### x 为对象或函数
     * - 把 x.then 赋值给 then 
     * - 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
     * - 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
     *  - 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
     *  - 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
     *  - 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
     *  - 如果调用 then 方法抛出了异常 e：
     *      - 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略
     *      - 否则以 e 为据因拒绝 promise
     *  - 如果 then 不是函数，以 x 为参数执行 promise
     * - 如果 x 不为对象或者函数，以 x 为参数执行 promise
     * 
     */
    resolutionProcedure = (promise: MyPromise<any>, x: any, resolve, reject) => {
        if (promise === x) {
            reject(new TypeError('Error'));
        } else if (x instanceof MyPromise) {
            x.then(
            val => this.resolutionProcedure(promise, val, resolve, reject), 
            reject);
        } else if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
            try {
                const then = x.then;
                then.call(
                    x, 
                    y => {
                        if (this.hasCalledResolution) {
                            return;
                        }
                        this.hasCalledResolution = true;
                        this.resolutionProcedure(promise, y, resolve, reject)
                    },
                    e => {
                        if (this.hasCalledResolution) {
                            return;
                        }
                        this.hasCalledResolution = true;
                        reject(e);
                    }
                )
            } catch (e) {
                if (this.hasCalledResolution) {
                    return;
                }
                this.hasCalledResolution = true;
                reject(e);
            }
        } else {
            resolve(x);
        }
    }
}

const p1 = new MyPromise<any>((res, rej) => {
    // throw('error'); 
    res(1);
})

p1.then(val => {
    console.log('res:', val);
}, e => console.log('rej: ', e));

const p2 = p1.then(res => {
    return new MyPromise((res, rej) => {
        // res(2)
        res(new MyPromise((_res, _rej) => {
            _res(3)
        }));
    })
})

p2.then(val => {
    console.log('res:', val);
}, e => console.log('rej2: ', e));

// TODO: 纠正并完善ts类型声明
// TODO: 增加catch
// TODO: 增加all
// TODO: 增加race
