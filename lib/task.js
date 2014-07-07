import { Promise } from 'rsvp';
import asap from 'rsvp/asap';

function Task(thunk, self) {
  this._result = undefined;
  this._resolved = true;
  var task = this;
  this.result = new Promise(function(resolve, reject) {
    task.resolve = resolve;
    task.reject = reject;
  });
  this._thread = thunk.call(self);
}

/**
 * Creates and starts a new Task with the given task body.
 *
 * @param thunk function() -> iterator<any,T>
 * @param self = undefined
 * @return Promise<T>
 */
export default function spawn(thunk, self) {
  var task = new Task(thunk, self);
  asap(function() {
    task.resume();
  });
  return task.result;
};

var Tp = Task.prototype;

Tp.resume = function() {
  try {
    var next = this._resolved
      ? this._thread.next(this._result)
      : this._thread.throw(this._result); // FIXME: does this get translated to ["throw"]?
      if (next.done) {
        var value = next.value;
        this._result = value;
        this._resolved = true;
        this.resolve(value);
      } else {
        var task = this;
        next.value.then(function(value) {
          task._result = value;
          task._resolved = true;
          task.resume();
        }, function(error) {
          task._result = error;
          task._resolved = false;
          task.resume();
        });
      }
  } catch (error) {
    this._result = error;
    this._resolved = false;
    this.reject(error);
  }
};

Tp.toString = function() {
  return "[object Task]";
};
