const dbconfig = {
	user:'dglunts',
	password:'Qtnqf-of$Henr0!',
	database:'writingsdb',
	port:5432,
	max:100,
	idleTimeoutMillis:30000
}

const {Pool} = require('pg');

const pool = new Pool(dbconfig);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err.stack)
  process.exit(-1)
})

pool.on('connect', (client) => {
	console.log('Pool connected to Postgres');
  	client.query('SET DATESTYLE = iso, dmy')
})

module.exports = {
	
	query: (text,params,callback) => {
		const start = Date.now();
		return pool.query(text,params,(err,res)=>{
			const duration = Date.now() - start;
			console.log('executed query:',{text,params,duration});//,rows: res.rowCount});
			if (callback) {callback(err,res);}
		});
	}
	,
	stop: () => { pool.end(() => { 
			console.log('pool has ended');
		})
	}
	,
	getPgClient: (callback) => {
	  pool.connect((err, client, done) => {
			console.log('Counts: total='+pool.totalCount+' idle='+pool.idleCount);
      		if (callback) {callback(err, client, done);}
		})
	}
	,
	getPgClient2: () => {
		return pool.connect();
	}

}
