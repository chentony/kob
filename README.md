## Intro

Enhanced koa framework, support router and template

## Installation

```
$ npm install kob
```

  Kob is supported in all versions of [iojs](https://iojs.org) without any flags.

  To use Kob with node, you must be running __node 0.11.16__ or higher for generator and promise support, and must run node(1)
  with the `--harmony-generators` or `--harmony` flag.

## Example

```js
var kob = require('kob');
var app = kob();

// router

app.get('/', function* () { 
  this.render('template.html', { // using nunjucks
    key: 'value'
  });
});

// same as koa

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```