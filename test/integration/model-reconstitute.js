var should   = require('should');
var helper   = require('../support/spec_helper');
var ORM      = require('../../');

describe("Model.reconstitute()", function() {
	var db = null;
	var Pet = null;
	var Person = null;

	var setup = function () {
		return function (done) {
			Person = db.define("person", {
				name   : String
			});
			Pet = db.define("pet", {
				name   : { type: "text", defaultValue: "Mutt" }
			});
			Person.hasMany("pets", Pet);

			return helper.dropSync([ Person, Pet ], done);
		};
	};

	before(function (done) {
		helper.connect(function (connection) {
			db = connection;

			return done();
		});
	});

	after(function () {
		return db.close();
	});

	describe("if passing a hash", function () {
		before(setup());

		it("should accept it instantiate a model", function (done) {
			Person.reconstitute({
				name : "John Doe"
			}, function (err, John) {
				should.equal(err, null);
				John.should.have.property("name", "John Doe");
				should.equal(John.isInstance, true);

				return done();
			});
		});


	});

});
