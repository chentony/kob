'use strict';

var koa = require('koa');
var path2reg = require('path-to-regexp');
var template = require('nunjucks');
var util = require('util');

function router (method, path, fn) {
  var reg = path2reg(path);
  return function* (next) {
    var m; 
    if (this.method === method && (m = reg.exec(this.path))) {
      yield* fn.apply(this, m.slice(1));
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

function compose (fn) {
  var args = arguments;
  return args.length <= 1 ? fn : function* (next) {
    var self = this;
    yield* Array.prototype.reduceRight.call(args, function (a, b) { return b.call(self, a); }, next);
  }
}


util.inherits(kob, koa);

function kob() {
  if (!(this instanceof kob)) return new kob();

  koa.call(this);

  this.context.render = function* (path, ctx) {
    this.body = yield render(path, ctx);
  };
}

kob.prototype.use = function () {
  koa.prototype.use.call(this, compose.apply(null, arguments));
};

kob.prototype.get = function (path, fn) {
  this.use(router('GET', path, fn));
  return this;
};

kob.prototype.post = function (path, fn) {
  this.use(router('GET', path, fn));
  return this;
};

module.exports = kob;




