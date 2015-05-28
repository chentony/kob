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
