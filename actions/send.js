var helpers = require("../helpers");
var template = "send.ejs";
var AWS = require("aws-sdk");
var configFilePath = "config.json";
var prefix = "marcin.gradzki";
var appConfig = {
	"QueueUrl" : "https://sqs.us-west-2.amazonaws.com/983680736795/gradzkiSQS"
}
//commit
var Queue = require("queuemanager");

exports.action = function(request, callback) {

	AWS.config.loadFromPath(configFilePath);
	var keys = request.query.keys;
	keys = Array.isArray(keys)?keys:[keys];
	keys.forEach(function(key){
		var queue = new Queue(new AWS.SQS(), appConfig.QueueUrl);
		queue.sendMessage(key, function(err, data){
			var simpledb = new AWS.SimpleDB();

			var dbParams = {
				Attributes: [{
					Name:"key",
					Value: key,
					Replace: false
				}],
				DomainName: 'marcin.gradzki', /* required */
				ItemName: "Wyslano do kolejki" /* required */
			};
			simpledb.putAttributes(dbParams, function(err, data) {
				if (err)
					callback(null, {template: template, params:{send:true, log:false, keys:keys, prefix:prefix}});
				else
					callback(null, {template: template, params:{send:true, log:true, keys:keys, prefix:prefix}});
			});

		});
	});

}
