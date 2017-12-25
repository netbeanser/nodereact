////Этот файл приведен в целях иллюстрации использования callbacks при 
//обращении к БД. Все это прекрасно работает, но из-за цикла по документам 
// коллекции MongoDbне  - не в данном случае.
// Работающий вариант - в модуле mmopus.js, где использовано синхронное API для доступа к Postgres

const mn = require('../../db/mdb');
const pg = require('../../db/pdb');
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer();
const wss = new WebSocket.Server({host: 'localhost', port: 33712, path: '/progress',clientTracking: true, server: server});


wss.on('listening', () => console.log('WSS listening'));

wss.on('connection', (ws,req) => {
	console.log('WSS Connected: ' + req.connection.remoteAddress);
	_dissectDoc();
});

wss.on('message',((msg) => console.log('msg')));
wss.on('close',() => console.log('Client disconnected'));


function _listDocs(req,res,next) {
	mn.getMongoDb()
	.then((mdb) => {
		mdb.collection('opus').find().toArray() //toArray() без параметров возвращает Promise 
		.then( result => {
			res.send(result);				
		})
		.catch(err => console.error('Error while converting collection to array: '+err.stack));
	})
	.catch((err) => {
		console.error('Mongo error from listDocs: ' + err.stack);
		process.exit(-1);
	});
}

function _dissectDoc () {

	const sqlA = 'INSERT INTO AUTHORTBL (name,lastpublished) VALUES($1,to_date($2,'YYYY-MM-DD')) '
	+'ON CONFLICT (name) DO UPDATE SET lastpublished = EXCLUDED.lastpublished RETURNING *';
	//On CONFLICT - это фишка Postgres. На поле name в таблице AUTHORTBL приделан униувльный ключ.
	//Она используется здесь, чтобы избежать при вставке новой записи конфликта по полю name

	const sqlO = 'INSERT INTO OPUSTBL (authorid,title,description,published) VALUES($1,$2,$3,$4) RETURNING *';

	mn.getMongoDb()
	.then((mdb) => {

//По-хорошеиу, надо вставлять записи в несколько таблиц в рамках транзакции
//Но ввиду асинхронной природы NodeJS это вряд ли будет работать.

		let cursor = mdb.collection('opus').find();
		cursor.each((err,item) => {
			if (err) {
			console.error("cursor error: "+err);
			} else {
				if ( item !== null ) {		
					console.log(item);
					if (item.name !== null){

					let progressMsg = new Object(); //Сообщение для клиента о текущем обрабатываемом документе MongoDb
					progressMsg.mnopus = item;

					let paramsA = [];

					paramsA.push(item.name);					
					let lastpublished = item.lastpublished.toISOString().substring(0,10);

					paramsA.push(lastpublished);			
					console.log("ParamsA: "+paramsA);									

					const insertA = {
						name: 'insertA',
						text: sqlA,
						values: paramsA
					}

					pg.query(insertA, (err,res) => {
						if (err) {
							console.error('Error inserting author:' +err);
						} else {
							console.log('Inserted into AUTHORTBL: '+ res.rows[0]);

							progressMsg.pgauthor = res.rows[0];

							let paramsO = [];

							//Здесь иы создаем отношение one-to-many между таблицами AUTHORTBL (one) и OPUSTBL (many) через ынешний ключ authorid 
							//в таблице OPUSTBL. Поэтому нам нужен id (первичный ключ)  вставленной записи в AUTHORTBL
							let authorId = res.rows[0].id; 
//Именно здесь асинхронность NodeJS дает себя знать: в слежующем цикле each в callback-ах переменная res уже другая.

							paramsO = paramsO.concat([authorId,item.title,item.description,item.published);							
							pg.query(sqlO, paramsO,(err,res) => {
								if (err) {
									conso;e.error('Error inserting author: +err');
									progressMsg.pgopus = res.rows[0];
									wss.clients.forEach(ws => ws.send(JSON.stringify(progressMsg)));
								} else {
									console.log('Inserted into OPUSTBL: '+ res.rows[0]);
								}								
							});				
						}				
					})
					}
				}
			}
		})
	})										
	.catch((err) => {
		console.error('Mongo error from dissectDoc: ' + err);
		process.exit(-1);
	});	
}

module.exports = {
	listDocs: _listDocs,
	dissectDoc : _dissectDoc
}



