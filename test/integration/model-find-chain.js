var should   = require('should');
var helper   = require('../support/spec_helper');
var ORM      = require('../../');
var common   = require('../common');

describe("Model.find() chaining", function() {
	var db = null;
	var Person = null;
	var Dog = null;

	var setup = function () {
		return function (done) {
			Person = db.define("person", {
				name    : String,
				surname : String,
				age     : Number
			});
			Person.hasMany("parents");
			Person.hasOne("friend");

			ORM.singleton.clear(); // clear cache

			return helper.dropSync(Person, function () {
				Person.create([{
					name      : "John",
					surname   : "Doe",
					age       : 18,
					friend_id : 1
				}, {
					name      : "Jane",
					surname   : "Doe",
					age       : 20,
					friend_id : 1
				}, {
					name      : "Jane",
					surname   : "Dean",
					age       : 18,
					friend_id : 1
				}], done);
			});
		};
	};

	var setup2 = function () {
		return function (done) {
			Dog = db.define("dog", {
				name: String,
			});
			Dog.hasMany("friends");
			Dog.hasMany("family");

			ORM.singleton.clear(); // clear cache

			return helper.dropSync(Dog, function () {
				Dog.create([{
					name    : "Fido",
					friends : [{ name: "Gunner" }, { name: "Chainsaw" }],
					family  : [{ name: "Chester" }]
				}, {
					name    : "Thumper",
					friends : [{ name: "Bambi" }],
					family  : [{ name: "Princess" }, { name: "Butch" }]
				}], done);
			});
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

	describe(".limit(N)", function () {
		before(setup());

		it("should limit results to N items", function (done) {
			Person.find().limit(2).run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 2);

				return done();
			});
		});
	});

	describe(".skip(N)", function () {
		before(setup());

		it("should skip the first N results", function (done) {
			Person.find().skip(2).order("age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 1);
				instances[0].age.should.equal(20);

				return done();
			});
		});
	});

	describe(".offset(N)", function () {
		before(setup());

		it("should skip the first N results", function (done) {
			Person.find().offset(2).order("age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 1);
				instances[0].age.should.equal(20);

				return done();
			});
		});
	});

	describe("order", function () {
		before(setup());

		it("('property') should order by that property ascending", function (done) {
			Person.find().order("age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				instances[0].age.should.equal(18);
				instances[2].age.should.equal(20);

				return done();
			});
		});

		it("('-property') should order by that property descending", function (done) {
			Person.find().order("-age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				instances[0].age.should.equal(20);
				instances[2].age.should.equal(18);

				return done();
			});
		});

		it("('property', 'Z') should order by that property descending", function (done) {
			Person.find().order("age", "Z").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				instances[0].age.should.equal(20);
				instances[2].age.should.equal(18);

				return done();
			});
		});
	});

	describe("only", function () {
		before(setup());

		it("('property', ...) should return only those properties, others null", function (done) {
			Person.find().only("age", "surname").order("-age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				instances[0].should.have.property("age");
				instances[0].should.have.property("surname", "Doe");
				instances[0].should.have.property("name", null);

				return done();
			});
		});

		// This works if cache is disabled. I suspect a cache bug.
		xit("(['property', ...]) should return only those properties, others null", function (done) {
			Person.find().only([ "age", "surname" ]).order("-age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				instances[0].should.have.property("age");
				instances[0].should.have.property("surname", "Doe");
				instances[0].should.have.property("name", null);

				return done();
			});
		});
	});

	describe("omit", function () {
		before(setup());

		it("('property', ...) should not get these properties", function (done) {
			Person.find().omit("age", "surname").order("-age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				if (common.protocol() != "mongodb") {
					should.exist(instances[0].id);
				}
				should.exist(instances[0].friend_id);
				instances[0].should.have.property("age", null);
				instances[0].should.have.property("surname", null);
				instances[0].should.have.property("name", "Jane");

				return done();
			});
		});

		it("(['property', ...]) should not get these properties", function (done) {
			Person.find().omit(["age", "surname"]).order("-age").run(function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 3);
				instances[0].should.have.property("age", null);
				instances[0].should.have.property("surname", null);
				instances[0].should.have.property("name", "Jane");

				return done();
			});
		});
	});

	describe(".count()", function () {
		before(setup());

		it("should return only the total number of results", function (done) {
			Person.find().count(function (err, count) {
				should.equal(err, null);
				count.should.equal(3);

				return done();
			});
		});
	});

	describe(".first()", function () {
		before(setup());

		it("should return only the first element", function (done) {
			Person.find().order("-age").first(function (err, JaneDoe) {
				should.equal(err, null);

				JaneDoe.name.should.equal("Jane");
				JaneDoe.surname.should.equal("Doe");
				JaneDoe.age.should.equal(20);

				return done();
			});
		});

		it("should return null if not found", function (done) {
			Person.find({ name: "Jack" }).first(function (err, Jack) {
				should.equal(err, null);
				should.equal(Jack, null);

				return done();
			});
		});
	});

	describe(".last()", function () {
		before(setup());

		it("should return only the last element", function (done) {
			Person.find().order("age").last(function (err, JaneDoe) {
				should.equal(err, null);

				JaneDoe.name.should.equal("Jane");
				JaneDoe.surname.should.equal("Doe");
				JaneDoe.age.should.equal(20);

				return done();
			});
		});

		it("should return null if not found", function (done) {
			Person.find({ name: "Jack" }).last(function (err, Jack) {
				should.equal(err, null);
				should.equal(Jack, null);

				return done();
			});
		});
	});

	describe(".find()", function () {
		before(setup());

		it("should not change find if no arguments", function (done) {
			Person.find().find().count(function (err, count) {
				should.equal(err, null);
				count.should.equal(3);

				return done();
			});
		});

		it("should restrict conditions if passed", function (done) {
			Person.find().find({ age: 18 }).count(function (err, count) {
				should.equal(err, null);
				count.should.equal(2);

				return done();
			});
		});

		it("should restrict conditions if passed and also be chainable", function (done) {
			Person.find().find({ age: 18 }).find({ name: "Jane" }).count(function (err, count) {
				should.equal(err, null);
				count.should.equal(1);

				return done();
			});
		});

		it("should return results if passed a callback as second argument", function (done) {
			Person.find().find({ age: 18 }, function (err, instances) {
				should.equal(err, null);
				instances.should.have.property("length", 2);

				return done();
			});
		});

		it("should ignore sql where conditions", function (done) {
			Person.find({ age: 18 }).where("LOWER(surname) LIKE 'dea%'").all(function (err, items) {
				should.equal(err, null);
				items.length.should.equal(2);

				return done();
			});
		});

	});

	describe(".remove()", function () {
		before(setup());

		it("should have no problems if no results found", function (done) {
			Person.find({ age: 22 }).remove(function (err) {
				should.equal(err, null);

				Person.find().count(function (err, count) {
					should.equal(err, null);

					count.should.equal(3);

					return done();
				});
			});
		});

		it("should remove results and give feedback", function (done) {
			Person.find({ age: 20 }).remove(function (err) {
				should.equal(err, null);

				Person.find().count(function (err, count) {
					should.equal(err, null);

					count.should.equal(2);

					return done();
				});
			});
		});
	});

	describe(".eager()", function () {
		before(setup2());

		// TODO: Remove this code once the Mongo eager loading is implemented
		var isMongo = function () {
			if (db.driver.config.protocol == "mongodb:") {
				(function () {
					Dog.find().eager("friends").all(function () {
						// Should not ever run.
					});
				}).should.throw();

				return true;
			}
			return false;
		};

		it("should fetch all listed associations in a single query", function (done) {

			Dog.find({ name: ["Fido", "Thumper"] }).eager("friends").all(function (err, dogs) {
				should.equal(err, null);

				should(Array.isArray(dogs));

				dogs.length.should.equal(2);

				dogs[0].friends.length.should.equal(2);
				dogs[1].friends.length.should.equal(1);
				done();
			});
		});

		it("should be able to handle multiple associations", function (done) {

			Dog.find({ name: ["Fido", "Thumper"] }).eager("friends", "family").all(function (err, dogs) {
				should.equal(err, null);

				should(Array.isArray(dogs));

				dogs.length.should.equal(2);

				dogs[0].friends.length.should.equal(2);
				dogs[0].family.length.should.equal(1);
				dogs[1].friends.length.should.equal(1);
				dogs[1].family.length.should.equal(2);
				done();
			});
		});

		it("should work with array parameters too", function (done) {

			Dog.find({ name: ["Fido", "Thumper"] }).eager(["friends", "family"]).all(function (err, dogs) {
				should.equal(err, null);

				should(Array.isArray(dogs));

				dogs.length.should.equal(2);

				dogs[0].friends.length.should.equal(2);
				dogs[0].family.length.should.equal(1);
				dogs[1].friends.length.should.equal(1);
				dogs[1].family.length.should.equal(2);
				done();
			});
		});
	});

});
