const Migrate = require('../lib/migrate');

exports.migrate = async function(client, done) {
	try {
		const script = "if (ctx._source.encoding instanceof Object) {ctx._source.encoding = [ ctx._source.encoding.id ]}";
		await Migrate.migrate({ "resources": script });

		done();
	} catch(e) {
		console.error(e);
		done(e);
	}
};

exports.rollback = function(client, done) {
	done();
};
