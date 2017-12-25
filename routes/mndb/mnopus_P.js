////Этот файл приведен в целях иллюстрации использования Promise при 
//обращении к БД (в отличие от модуля mnopus_0.js, где использованы callbacks). 
//Все это прекрасно работает, но из-за цикла по документам 
// коллекции MongoDbне  - не в данном случае.
// Работающий вариант - в модуле mmopus.js, где использовано синхронное API для доступа к Postgres

const mn = require('../../db/mdb');
const pg = require('pg');
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

	const sqlA = "INSERT INTO AUTHORTBL (name,lastpublished) VALUES($1,to_date($2,'YYYY-MM-DD')) ON CONFLICT (name) DO UPDATE SET lastpublished = EXCLUDED.lastpublished RETURNING *";
	//On CONFLICT - это фишка Postgres. На поле name в таблице AUTHORTBL приделан униувльный ключ.
	//Она используется здесь, чтобы избежать при вставке новой записи конфликта по полю name

	const sqlO = 'INSERT INTO OPUSTBL (authorid,title,description,published) VALUES($1,$2,$3,$4) RETURNING *';

	mn.getMongoDb()
	.then((mdb) => {

		let cursor = mdb.collection('opus').find();
		
		cursor.each((err,item) => {
			if (err) {
				console.error("cursor error: "+err);
			} else {
				if ( item !== null ) {		
					console.log(item);
					if (item.name !== null){

					let progressMsg = new Object(); //Сообщение для клиента о текущем обраьатываемом документе MongoDb
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

					pg.getPgClient2()
					.then(clientA => clientA.query(insertA))
						.then(resA => {

							clientA.release();
							console.log('Inserted into AUTHORTBL: '+ resA.rows[0]);
							progressMsg.pgauthor = resA.rows[0];
							//Здесь иы создаем отношение one-to-many между таблицами AUTHORTBL (one) и OPUSTBL (many) через ынешний ключ authorid 
							//в таблице OPUSTBL. Поэтому нам нужен id (первичный ключ)  вставленной записи в AUTHORTBL
							let authorId = resA.rows[0].id;

							let paramsO = [];
							paramsO = paramsO.concat([authorId,item.title,item.description,item.published);							

							const insert0 = {
								name: 'insertO',
								text: sqlO,
								values: paramsO
							}

							pg.getClient2()
							.then(clientO => clientO.query(insertO))
								.then(resO => {

									clientO.release();
									console.log('inserted into OPUSTBL: '+resO.row[0]);
									progressMsg.pgopus = resO.rows[0];
									//Отправляем через WebSocket обработанный документ
									wss.clients.forEach(ws => ws.send(JSON.stringify(progressMsg)));
								})
								.catch(err => {
									clientO.release();
									console.error('Error inserting into OPUSTBL: '+err.stack);									
								})																						
						.catch(err => {
							client.release();
							console.error('Error inserting into AUTHORTBL: '+err.stack);
						});																										
						}) //then resA
					.catch(err => {
					//	clientA.release();
						console.error('Error getting clientA from pool: '+err.stack);
					});//get pgClient2
					}//item !== null
				}//item !== null
			}//else cursor each
		})//cursor each
	})//then mdb
	.catch((err) => {
		console.error('Mongo error from dissectDoc: ' + err.stack);
		process.exit(-1);
	});	
}//dissectDoc

module.exports = {
	listDocs: _listDocs,
	dissectDoc : _dissectDoc
}


