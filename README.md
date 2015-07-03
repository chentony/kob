# Intro

Enhanced koa framework, support router and template

## Installation

```
$ npm install kob
```

## Example

```js
var kob = require('kob');
var app = kob();

// same as koa

app.use(function* (){
  this.body = 'Hello World';
});

// auto compose middlewares

app.use(function* () {
  this.body = 'Hi'
}, function* () {
  this.body += ' Tony!';
});

// router

app.get('/:name', function* (name) {
  yield* this.render('template.html', { // using nunjucks
    name: name
  });
});

// support middlewares while using router

app.get('/:name', function* (next){
  this.hello = 'Hi ';
}, function* (name, next) {
  this.body = this.hello + name;
});


app.listen(3000);
```
