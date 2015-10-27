
module.exports = {
	execQuery: function () {
		var query, cb;
		if (arguments.length == 2) {
			query = arguments[0];
			cb    = arguments[1];
		} else if (arguments.length == 3) {
			query = this.query.escape(arguments[0], arguments[1]);
			cb    = arguments[2];
		}
		return this.execSimpleQuery(query, cb);
	},
	eagerQuery: function (association, opts, keys, cb) {
		var desiredKey = Object.keys(association.field);
		var assocKey = Object.keys(association.mergeAssocId);

		var where = {};
		where[desiredKey] = keys;

		var query = this.query.select()
			.from(association.model.table)
			.select(opts.only)
			.from(association.mergeTable, assocKey, opts.keys)
			.select(desiredKey).as("$p")
			.where(association.mergeTable, where)
			.build();

		this.execSimpleQuery(query, cb);
	}
};
