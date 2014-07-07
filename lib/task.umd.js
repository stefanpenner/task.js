import Task from './task';

/* global define:true module:true window: true */
if (typeof define === 'function' && define.amd) {
  define(function() { return Task; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = Task;
} else if (typeof this !== 'undefined') {
  this['Task'] = Task;
}
