const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const pgdb  = require('./routes/pgdb'); //pgdb stands for Postgres
const mndb  = require('./routes/mndb');  //mndb stands for MongoDb

//Эти три строчки для отладочных целей
//console.log('pgdb.opus defined: '+pgdb.opus);
//console.log('pgdb.opus.find defined: '+pgdb.opus.findOpus);
//console.log('mndb.mnopus.dissectDoc defined: '+mndb.mnopus.dissectDoc);

const app = express();
//const wsInstance = require('express-ws')(app);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/opus/:id?', pgdb.opus.findOpus); //Postgres DB
app.get('/author/:id?', pgdb.author.findAuthor); //Postgres DB
app.get('/mnopus', mndb.mnopus.listDocs); //MongoDb

// Обработчик 404
app.use((req, res, next) => {
  res.status = 404;
  res.send('<b>404 </br>Not Found: </b>'+req.originalUrl);
});

// Четыре аргумента говорят express, что это обработчик ошибок
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error('Error: '+err.stack);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


 Ниже и до конца - проверка функциониования обработчиков. В дистрибутивном варианте не требуется

const mp = require('./routes/mndb').mnopus;

mp.dissectDoc();


var pg = require('./db/pdb').getPgClient2()
.then((client) => {
	console.log('Client from pool connected to Postgres');
	client.query('select * from opustbl')
		.then((res) => {
			client.release();
			console.log(res.rows);

		})
		.catch((err) => {
			client.release();
			console.error('Query failed: '+err);	
		})
})
.catch((err) => console.error('PgPool connection failed: '+err) );


module.exports = app;
