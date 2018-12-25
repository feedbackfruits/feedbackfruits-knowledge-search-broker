const Migrate = require('../lib/migrate');

exports.migrate = async function(client, done) {
	try {
		await Migrate.migrate({ "resources": null, "autocomplete": null });

		done();
	} catch(e) {
		console.error(e);
		done(e);
	}
};

exports.rollback = function(client, done) {
	done();
};
