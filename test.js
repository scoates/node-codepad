var cp = require('./codepad');

cp.eval('PHP', '<?php echo "foo\nbar";', function (err, out) {
	if (err) {
		console.log("Error: ", err);
	} else {
		console.log(out);
	}
}, true);

cp.eval('PHP', '<?php /*no output*/;', function (err, out) {
	if (err) {
		console.log("Error: ", err);
	} else {
		console.log(out);
	}
}, true);
