/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-bag-tiddler.js
type: application/javascript
module-type: mws-route

GET /bags/:bag_name/tiddler/:title


\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.method = "GET";

exports.path = /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/;

exports.handler = function(request,response,state) {
	// Get the  parameters
	var bag_name = $tw.utils.decodeURIComponentSafe(state.params[0]),
		title = $tw.utils.decodeURIComponentSafe(state.params[1]),
		result = bag_name && $tw.mws.store.getBagTiddler(title,bag_name);
	if(bag_name && result) {
		// If application/json is requested then this is an API request, and gets the response in JSON
		if(request.headers.accept && request.headers.accept.indexOf("application/json") !== -1) {
				var tiddlerFields = {},
				knownFields = [
					"bag", "created", "creator", "modified", "modifier", "permissions", "recipe", "revision", "tags", "text", "title", "type", "uri"
				];
			$tw.utils.each(result.tiddler,function(value,name) {
				if(knownFields.indexOf(name) !== -1) {
					tiddlerFields[name] = value;
				} else {
					tiddlerFields.fields = tiddlerFields.fields || {};
					tiddlerFields.fields[name] = value;
				}
			});
			tiddlerFields.type = tiddlerFields.type || "text/vnd.tiddlywiki";
			state.sendResponse(200,{"Content-Type": "application/json"},JSON.stringify(tiddlerFields),"utf8");
			return;
		} else {
			// This is not a JSON API request, we should return the raw tiddler content
			const result = $tw.mws.store.getBagTiddlerStream(title,bag_name);
			if(result) {
				response.writeHead(200, "OK",{
					"Content-Type":  result.type
				});
				result.stream.pipe(response);
				return;
			}
		}
	}
	response.writeHead(404);
	response.end();
};

}());
