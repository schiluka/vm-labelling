//var request = require('request');
var request = require('superagent');
/*exports.getVideo = function(http, aToken) {
	console.log('Getting file from Box:' + aToken);
	//Folder id - 0 means root folder
	var options = {
  		host: 'https://api.box.com',
  		path: '/2.0/folders/0/items?limit=100&offset=0',
  		headers: {Authorization : 'Bearer ' + aToken}
	};
	var boxResp;
	http.get(options, function(response) {
		//boxResp = response;
		console.log('BOX FOLDER response');
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
	}).end();
	
};
exports.getVideo = function(aToken) {
	console.log('Getting file contents:' + aToken);
	var options = {
		uri: 'https://api.box.com/2.0/folders/0/items',
		headers: {Authorization: ' Bearer ' + aToken}
	};
	request.get(options, function(response) {
		//boxResp = response;
		console.log('BOX FOLDER response');
		console.log(response);
	});
};*/

exports.getVideo = function(aToken) {
	var token = aToken + '';
	console.log(aToken);
	request.get('https://api.box.com/2.0/folders/1277096025/items')
		.query({ limit: '100' })
		.query({ offset: '0' })
		.set('Authorization', 'Bearer ' + token)
		.end(
		function(response) {
		//boxResp = response;
		console.log('BOX FOLDER response');
		console.log(response.text);
	});
};