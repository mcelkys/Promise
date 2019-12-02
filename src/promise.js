if (!('Promise' in self)) {
    (function() {

        var PENDING = 0;
        var SETTLED = 1;
        var FULFILLED = 2;
        var REJECTED = 3;
        var FUNCTION = 'function';

        function PromiseSubscriber(status, handler) {
            this.status = status;
            this.handler = handler;
        }

        PromiseSubscriber.prototype = Object.create(Object.prototype);
        PromiseSubscriber.prototype.constructor = PromiseSubscriber;

        PromiseSubscriber.prototype.invoke = function(promise) {
            promise._status = PENDING;
            try {
                var result = this.handler(promise._value);
                if (result instanceof Promise) {
                    result.then(promise._resolve.bind(promise));
                    result.catch(promise._reject.bind(promise));
                } else
                    promise._resolve(result);
            } catch (error) {
                promise._reject(error);
            }
        };

        function ThenSubscriber(handler) {
            PromiseSubscriber.call(this, FULFILLED, handler);
        }

        ThenSubscriber.prototype = Object.create(PromiseSubscriber.prototype);
        ThenSubscriber.prototype.constructor = ThenSubscriber;

        function CatchSubscriber(handler) {
            PromiseSubscriber.call(this, REJECTED, handler);
        }

        CatchSubscriber.prototype = Object.create(PromiseSubscriber.prototype);
        CatchSubscriber.prototype.constructor = CatchSubscriber;

        function FinallySubscriber(handler) {
            PromiseSubscriber.call(this, SETTLED, handler);
        }

        FinallySubscriber.prototype = Object.create(PromiseSubscriber.prototype);
        FinallySubscriber.prototype.constructor = FinallySubscriber;

        FinallySubscriber.prototype.invoke = function(promise) {
            try {
                this.handler();
                promise._settle();
            } catch (error) {
                promise._status = PENDING;
                promise._reject(error);
            }
        };

        self.Promise = function Promise(executor) {
            this._status = PENDING;
            this._value = undefined;
            this._subscribers = [];
            var me = this;
            try {
                executor(function(value) {
                    me._resolve(value);
                }, function(reason) {
                    me._reject(reason);
                });
            } catch (error) {
                this._reject(error);
            }
        };

        Promise.prototype = Object.create(Object.prototype);
        Promise.prototype.constructor = Promise;

        Promise.prototype.then = function(onFulfilled, onRejected) {
            var subscriber = new ThenSubscriber(onFulfilled);
            this._addSubscriber(subscriber);
            if (typeof onRejected === FUNCTION)
                this.catch(onRejected);
            return this;
        };

        Promise.prototype.catch = function(onRejected) {
            var subscriber = new CatchSubscriber(onRejected);
            return this._addSubscriber(subscriber);
        };

        Promise.prototype.finally = function(onFinally) {
            var subscriber = new FinallySubscriber(onFinally);
            return this._addSubscriber(subscriber);
        };

        Promise.prototype._addSubscriber = function(subscriber) {
            this._subscribers.push(subscriber);
            this._settle();
            return this;
        };

        Promise.prototype._resolve = function(value) {
            if (this._status === PENDING) {
                this._status = FULFILLED;
                this._value = value;
                this._settle();
            }
        };

        Promise.prototype._reject = function(reason) {
            if (this._status === PENDING) {
                this._status = REJECTED;
                this._value = reason;
                this._settle();
            }
        };

        Promise.prototype._settle = function() {
            var subscriber;
            if (this._status > PENDING) {
                while (this._subscribers.length > 0) {
                    subscriber = this._subscribers.shift();
                    if (subscriber.status === this._status || subscriber.status === SETTLED)
                        break;
                    else subscriber = null;
                }
                if (subscriber)
                    subscriber.invoke(this);
                else if (this._status === REJECTED)
                    console.error('Uncaught (in promise)', this._value);
            }
        };

        Promise.resolve = function(value) {
            return new Promise(function(resolve, reject) {
                if (value instanceof Promise) {
                    value.then(resolve);
                    value.catch(reject);
                } else
                    resolve(value);
            });
        };

        Promise.reject = function(reason) {
            return new Promise(function(resolve, reject) {
                if (value instanceof Promise) {
                    value.then(resolve);
                    value.catch(reject);
                } else
                    reject(reason);
            });
        };

        Promise.all = function(iterable) {
            return new Promise(function(resolve, reject) {
                var size = iterable.length;
                var results = new Array(size);
                var completed = 0;
                var promise, i;

                function onFulfilled(index) {
                    return function(value) {
                        results[index] = value;
                        completed++;
                        if (completed >= size)
                            resolve(results);
                    };
                }

                for (i = 0; i < size; i++) {
                    promise = iterable[i];
                    if (promise instanceof Promise) {
                        promise.then(onFulfilled(i));
                        promise.catch(reject);
                    } else {
                        results[i] = promise;
                        completed++;
                    }
                }

                if (completed >= size)
                    resolve(results);
            });
        };

        Promise.allSettled = function(iterable) {
            return new Promise(function(resolve) {
                var size = iterable.length;
                var results = new Array(size);
                var completed = 0;
                var promise, i;

                function settle(index, result) {
                    results[index] = result;
                    completed++;
                    if (completed >= size)
                        resolve(results);
                }

                function onFulfilled(index) {
                    return function(value) {
                        settle(index, {
                            status: 'fulfilled',
                            value: value
                        });
                    };
                }

                function onRejected(index) {
                    return function(reason) {
                        settle(index, {
                            status: 'rejected',
                            reason: reason
                        });
                    };
                }

                for (i = 0; i < size; i++) {
                    promise = iterable[i];
                    if (promise instanceof Promise) {
                        promise.then(onFulfilled(i));
                        promise.catch(onRejected(i));
                    } else {
                        results[i] = {
                            status: 'fulfilled',
                            value: promise
                        };
                        completed++;
                    }
                }

                if (completed >= size)
                    resolve(results);
            });
        };

        Promise.race = function(iterable) {
            return new Promise(function(resolve, reject) {
                var size = iterable.length;
                var promise, i;

                for (i = 0; i < size; i++) {
                    promise = iterable[i];
                    if (promise instanceof Promise) {
                        promise.then(resolve);
                        promise.catch(reject);
                    } else
                        resolve(promise);
                }
            });
        };

    })();
}
