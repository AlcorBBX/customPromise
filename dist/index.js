"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var MyPromise = /** @class */ (function () {
    function MyPromise(initializer) {
        var _this = this;
        this.thenCbs = [];
        this.status = "pending";
        this.value = null;
        this.then = function (thenCb, catchCb) {
            var promise = new MyPromise(function (resolve, reject) {
                _this.thenCbs.push([thenCb, catchCb, resolve, reject]);
            });
            return promise;
        };
        this["catch"] = function (catchCb) {
            var promise = new MyPromise(function (resolve, reject) {
                _this.thenCbs.push([undefined, catchCb, resolve, reject]);
            });
            return promise;
        };
        this.resolve = function (value) { };
        this.reject = function (reason) {
            _this.status = "rejected";
            _this.error = reason;
        };
        this.processNextTasks = function () {
            (0, utils_1.asap)(function () {
                if (_this.status === "pending") {
                    return;
                }
                var thenCbs = _this.thenCbs;
                _this.thenCbs = [];
                thenCbs.forEach(function (_a) {
                    var thenCb = _a[0], catchCb = _a[1], resolve = _a[2], reject = _a[3];
                    try {
                        if (_this.status === "fulfilled") {
                            var value = thenCb ? thenCb(_this.value) : _this.value;
                            resolve(value);
                        }
                        else {
                            if (catchCb) {
                                var value = catchCb(_this.error);
                                resolve(value);
                            }
                            else {
                                reject(_this.error);
                            }
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        };
        try {
            initializer(this.resolve, this.reject);
        }
        catch (error) {
            this.reject(error);
        }
    }
    MyPromise.resolve = function (value) {
        return new MyPromise(function (resolve) {
            resolve(value);
        });
    };
    MyPromise.reject = function (reason) {
        return new MyPromise(function (_, reject) {
            reject(reason);
        });
    };
    return MyPromise;
}());
// ===========================================================================
var sleep = function (ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, ms);
    });
};
var promise = new Promise(function (resolve) {
    setTimeout(function () {
        resolve(5);
    }, 1);
})
    .then(function (value) {
    console.log("value: ", value);
    return sleep(5000);
})
    .then(function (value) {
    console.log("=========================");
})["catch"](function (error) {
    console.error("error", error);
});
