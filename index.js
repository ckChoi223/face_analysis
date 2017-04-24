'use strict';

var express = require('express');
var app = express();
var port = process.env.PORT || 3000; //port number 설정 
var env = process.env.NODE_ENV || 'development'; //현재 개발 중이므로 development로 설정, 완료하면 production으로 바꿔줌 
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.listen(port, function() {  //port 연결
    console.log('Server On!');
});
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

setTimeout(function () {
  console.log('This will still run.');
}, 500);

var bodyParser = require('body-parser');

app.set('view engine','ejs'); 
app.use(express.static(__dirname + '/public')); //static 폴더 세팅
app.use(bodyParser.json()); //bodyParser를 사용하여 json형식의 파일 이동 
app.use(bodyParser.urlencoded({extended:true})); //bodyParser를 사용하여 url인코딩 사용

app.use('/', require('./routes/get'));
app.use('/', require('./routes/post'));