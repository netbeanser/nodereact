const mn = require('../../db/mdb');
const pgClient = require('pg-native');
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

	const sqlA = "INSERT INTO AUTHORTBL (name,lastpublished) VALUES($1,to_date($2,'YYYY-MM-DD')) "
	+"ON CONFLICT (name) DO UPDATE SET lastpublished = EXCLUDED.lastpublished RETURNING *";
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

					const connStr = 'postgresql://dglunts:Qtnqf-of$Henr0!@localhost:5432/writingsdb';

					const pg = new pgClient();
					pg.connectSync(connStr);

					pg.prepareSync('insertA',sqlA,2);
					var rowsA = pg.executeSync('insertA',paramsA);
					console.log('Inserted into AUTHORTBL: id='+rowsA[0].id+' name='+rowsA[0].name+' lastpublished='+rowsA[0].lastpublished);
					progressMsg.pgauthor = rowsA[0];
					let authorId = rowsA[0].id;

					let paramsO = [];
					paramsO = paramsO.concat([authorId,item.title,item.description,item.published.toISOString().substring(0,10)]);							

					pg.prepareSync('insertO',sqlO,4);
					var rowsO = pg.executeSync('insertO',paramsO);
					console.log('Inserted into OPUSTBL: id='+rowsO[0].id+' title='+rowsO[0].title+' description='+rowsO[0].description+' published='+rowsO[0].published);
					progressMsg.pgopus = rowsO[0];

					//Отправляем через WebSocket обработанный документ
					wss.clients.forEach(ws => ws.send(JSON.stringify(progressMsg)));					

				}//item.name !== null
			}//item !== null
		}//else cursor each
		})//cursor each
	}) //then mdb	
}//dissectDoc

module.exports = {
	listDocs: _listDocs,
	dissectDoc : _dissectDoc
}


