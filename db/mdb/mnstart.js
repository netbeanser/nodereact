const MONGO_DATABASE = 'writingsdb';
const MONGO_SERVER = 'localhost';

const mongoDb 		= require('mongodb').Db;
const mongoServer 	= require('mongodb').Server;



module.exports = {
	
	getMongoDb: () => {

		const db = new mongoDb(MONGO_DATABASE,
							new mongoServer(MONGO_SERVER,27017,{auto_reconnect:true}),
							{w:1,wtimeout:100});
		const promise = new Promise(
		(resolve,reject) => {
			db.open((err,db) => {
				if (err) {
				return reject(err);
			}
			return resolve(db);						
			}
		);					
		});
		return promise;
//Вообще говоря, promise здесь использовать не обязательно,
//но во избежание т.наз. pyramid of doom, да и для красоты не повредит.
//Хотя асинхронный характер promise'ов может сильно испортить жизнь		
	}
}
