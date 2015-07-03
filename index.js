'use strict';

var koa = require('koa');
var path2reg = require('path-to-regexp');
var template = require('nunjucks');
var util = require('util');

function router (method, path,/* middlewares */ fn) {
  var reg = path2reg(path);
  var args = Array.prototype.slice.call(arguments, 2);
  return function* (next) {
    var m; 
    if (this.method === method && (m = reg.exec(this.path))) {
      if (args.length === 1) { // no middlewares
        yield* fn.apply(this, m.slice(1));
        return;
      }
      // handle middlewares
      fn = args.pop(); 

      m.shift();m.unshift(this);
      args.push(fn.bind.apply(fn, m));// pass the rounter path parameters to the last middleware

      yield* compose.apply(null, args).call(this, next);
    } else {
      yield next;
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
  koa.prototype.use.call(this, compose.apply(null, arguments));
};

kob.prototype.get = function (path, fn) {
  this.use(router.apply(null, ['GET'].concat(Array.prototype.slice.call(arguments))));
  return this;
};

kob.prototype.post = function (path, fn) {
  this.use(router.apply(null, ['POST'].concat(Array.prototype.slice.call(arguments))));
  return this;
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




