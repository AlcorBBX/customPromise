"use strict";
exports.__esModule = true;
exports.asap = exports.isPromiseLike = void 0;
function isPromiseLike(value) {
    return Boolean(value &&
        typeof value === "object" &&
        "then" in value &&
        typeof value.then === "function");
}
exports.isPromiseLike = isPromiseLike;
function createAsap() {
    if (typeof MutationObserver === "function") {
        return function asap(callback) {
            var observer = new MutationObserver(function () {
                callback();
                observer.disconnect();
            });
            var target = document.createElement("div");
            observer.observe(target, { attributes: true });
            target.setAttribute("data-foo", "");
        };
    }
    else if (typeof process === "object" &&
        typeof process.nextTick === "function") {
        return function asap(callback) {
            process.nextTick(callback);
        };
    }
    else if (typeof setImmediate === "function") {
        return function asap(callback) {
            setImmediate(callback);
        };
    }
    else {
        return function asap(callback) {
            setTimeout(callback, 0);
        };
    }
}
exports.asap = createAsap();
