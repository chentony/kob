'use strict';

var koa = require('koa');
var path2reg = require('path-to-regexp');
var template = require('nunjucks');
var util = require('util');


function router (method, path,/* middlewares */ fn) {
  var reg = path2reg(path);
  var middlewares = Array.prototype.slice.call(arguments, 2, -1);
  fn = arguments[arguments.length - 1];
  return function* (next) {
    var m; 
    if (this.method === method && (m = reg.exec(this.path))) {
      if (middlewares.length === 0) { // no middlewares
        yield* fn.apply(this, m.slice(1).map(decodeURIComponent));
        return;
      }
      /*
       *  handle middlewares
       */
      m[0] = this; // pass the router path parameters to the last middleware
      yield* compose.apply(null, middlewares.concat([fn.bind.apply(fn, m)])).call(this, next);
    } else {
      yield* next;
    }

  };
};

function render (path, ctx) {
  return new Promise(function (resolve, reject) {
    template.render(path, ctx, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}


function compose (fn /* others */) {
  var args = arguments;
  return args.length <= 1 ? fn : function* (next) {
    var self = this;
    yield* Array.prototype.reduceRight.call(args, function (a, b) { return b.call(self, a); }, next);
  }
}


util.inherits(kob, koa);

function kob(opts) {
  if (!(this instanceof kob)) return new kob(opts);

  koa.call(this);

  opts = opts || {};

  if (opts.viewPath) template.configure(opts.viewPath);

  this.context.render = function* (path, ctx) {
    this.body = yield render(path, extend(opts.temlateObj, ctx));
  };
}

kob.prototype.use = function () {
  return koa.prototype.use.call(this, compose.apply(null, arguments));
};

kob.prototype.get = function (path, fn) {
  return koa.prototype.use.call(this, router.apply(null, ['GET'].concat(Array.prototype.slice.call(arguments))));
};

kob.prototype.post = function (path, fn) {
  return koa.prototype.use.call(this, router.apply(null, ['POST'].concat(Array.prototype.slice.call(arguments))));
};

module.exports = kob;


function extend() {
  return Array.prototype.reduce.call(arguments, function (a, b) {
    if (typeof b === 'object') {
      Object.keys(b).forEach(function (key) {
        a[key] = b[key];
      });
    }
    return a;
  }, {});
}




