var http = require('http')
  , querystring = require('querystring')
  , url = require('url');

var langs = [
	'C',
	'C++',
	'D',
	'Haskell',
	'Lua',
	'OCaml',
	'PHP',
	'Perl',
	'Python',
	'Ruby',
	'Scheme',
	'Tcl'
];

var codepadEval = function(lang, code, callback, fetchOutput, customProject) {
	if (-1 === langs.indexOf(lang)) {
		throw "Invalid language";
	}

	var options = {
		port: 80,
		path: '/',
		method: 'POST',
		host: 'codepad.org'
	};

	var data = '';
	var req = http.request(options, function(res) {
		res.on('data', function(chunk) {
			data += chunk;
		});

		res.on('end', function() {
			if (302 !== res.statusCode) {
				callback("Invalid response from codepad", null);
				return;
			}

			if (!fetchOutput) {
				callback(null, res.headers.location);
				return;
			}

			// fetch the result
			var resultUrl = res.headers.location;
			var u = url.parse(resultUrl);
			var resultOptions = {
				port: 80,
				path: u.pathname,
				host: u.hostname
			};
			var data = '';
			var resultReq = http.get(resultOptions, function(res) {
				res.on('data', function(chunk) {
					data += chunk;
				});

				res.on('end', function() {
					if (200 !== res.statusCode) {
						callback("Invalid response from inner request", null);
						return;
					}
					// should definitely not be doing this with a regex
					var re = new RegExp('<pre><a style="" name="output-line-1">1</a>[^]*?<pre>([^]*?)</pre>');
					var out = re.exec(data);
					if (out) {
						out = out[1].substr(1); // trim leading \n
					} else {
						out = '';
					}
					callback(null, {
						url: resultUrl,
						output: out
					});
				});
			});
		});
	});

	var reqData = {
		code: code,
		lang: lang,
		submit: 'Submit',
		run: 'True'
	};

	if (customProject) {
		reqData.project = customProject;
	}

	reqBody = querystring.stringify(reqData);
	req.setHeader('Content-Length', reqBody.length);
	req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

	req.end(reqBody);

};

exports.eval = codepadEval;
