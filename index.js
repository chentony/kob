'use strict';

var koa = require('koa');
var path2reg = require('path-to-regexp');
var template = require('nunjucks');

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
     yield* Array.prototype.reduceRight.call(args, function (a, b) { return b(a); }, next);
  }
}


module.exports = function () {
  var app = koa();

  app.context.render = function* (path, ctx) {
    this.body = yield render(path, ctx);
  };

  return {
    use: function () {
      app.use(compose.apply(null, arguments));
      return this;
    },
    get: function (path, fn) {
      app.use(router('GET', path, fn));
      return this;
    },
    post: function (path, fn) {
      app.use(router('POST', path, fn));
      return this;
    },
    listen: function () {
      app.listen.apply(app, arguments);
    }
  };
};




