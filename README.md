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

// router

app.get('/:name', function* (name) {
  yield* this.render('template.html', { // using nunjucks
    name: name
  });
});

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

app.listen(3000);
```
