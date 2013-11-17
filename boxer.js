//var request = require('request');
var request = require('superagent');
exports.getVideo = function(aToken) {
	var token = aToken + '';
	console.log(aToken);
	var football_clips = '1311201105';
	request.get('https://api.box.com/2.0/folders/1311201105/items')
		.query({ limit: '100' })
		.query({ offset: '0' })
		.set('Authorization', 'Bearer ' + token)
		.end(
		function(response) {
		//boxResp = response;
		console.log('BOX FOLDER response');
		var fileList = JSON.parse(response.text);
		console.log(fileList.entries);
		for (var i = 0; i < fileList.entries.length; i++) {
    		var file = fileList.entries[i];
    		console.log(file.id + '-----' + file.name);
    		if(file.name=='clip5.mp4') {
    			getFileDetails(file.id, token);
    		}
		}
	});
};
function getFileDetails(fileId, token) {
	console.log('getFileDetails is started');
	console.log(fileId + '=====' + token);
	request.get('https://api.box.com/2.0/files/'+fileId)
		.query({ limit: '100' })
		.query({ offset: '0' })
		.set('Authorization', 'Bearer ' + token)
		.end(function(response) {
				//var fileDetails = eval ("(" + response + ")");
				console.log('fileDetails response:' + response.statusCode);
				var output = '';
				var respText = JSON.parse(response.text);
				output = respText.shared_link.download_url;
				/*for (property in response) {
  					output += property + ': ' + response[property]+'; ';
				}*/
				console.log(output);
		});	
}