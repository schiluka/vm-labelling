var mysql      = require('mysql');
var fs = require('fs');
var secrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf-8'));
var dbh = mysql.createConnection({
  host     : 'localhost',
  user     : secrets.db.user,
  password : secrets.db.password,
});
dbh.connect();
exports.query = function() {
	dbh.query('SELECT 123 * 123 AS solution', function(err, rows, fields) {
  		if (err) throw err;
		console.log('rows from db: ', rows[0].solution);
	});
}

exports.end = function() {
	dbh.end();
}
