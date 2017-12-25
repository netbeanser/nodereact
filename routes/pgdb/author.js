const TBL_NAME = 'authortbl';
var pdb = require('../../db/pdb');

	function _findAll(req,res,next) {

		pdb.query('select * from '+TBL_NAME,null,(err,result) => {
		
			if (err){
				console.error('Error executing query: ',err.stack);
				return next(err);				
			}
			res.send(result.rows);			
		});
			
	}

	function _getById(req,res,next) {
		pdb.query('select * from ' + TBL_NAME + ' where id='+req.params.id, null, (err,result) => {
			if(err) {
				console.error('Error executing query: ',err.stack);
				return next(err);								
			}
			res.send(result.rows[0]);

		});
	}

	function _findAuthor(req,res,next) {
		if (req.params.id) {
			return _getById(req,res,next);
		} else {
			return _findAll(req,res,next);
		}

	}

module.exports = {
	findAuthor : _findAuthor
};