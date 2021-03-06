if (Meteor.isClient) {}
if (Meteor.isServer) {
  /* -- *  Tinytest.add('Throttle - Setup & Config', function (test) {    if (Meteor.isClient) {      return;    }    // verify base config    test.equal(      Throttle.isSetup,      false,      'config: isSetup = false'    );    test.equal(      Throttle._collectionName,      'throttles',      'config: _collectionName = throttles'    );    test.equal(      Throttle.debug,      false,      'config: debug = false'    );    test.equal(      Throttle.scope,      'normal',      'config: scope = normal'    );    test.equal(      Throttle.isMethodhelpersAllowed,      true,      'config: isMethodhelpersAllowed = true'    );  });  /* -- */
  Tinytest.add('Throttle - setup', function(test) {
    if (Meteor.isClient) {
      return;
    } // reset
    Throttle.resetSetup();
    test.equal(Throttle.isSetup, false, 'after setup(): isSetup = true'); // config
    Throttle.setCollection(new Mongo.Collection(null));
    Throttle.setup(); // verify base config
    test.equal(Throttle.isSetup, true, 'after setup(): isSetup = true');
    test.equal(Throttle.getCollection()._connection, null, 'after setup(): getCollection()._connection = null');
  });
  Tinytest.add('Throttle - setCollection(new Mongo.Collection(null))', function(test) {
    if (Meteor.isClient) {
      return;
    } // reset
    Throttle.resetSetup(); // config
    Throttle.setCollection(new Mongo.Collection(null));
    Throttle.setup(); // verify base config
    test.equal(Throttle.isSetup, true, 'after setup(): isSetup = true');
    test.equal(Throttle.getCollection()._connection, null, 'after setup(): getCollection()._connection = null');
  });
  Tinytest.add('Throttle - setCollection(new Mongo.Collection("foobar"))', function(test) {
    if (Meteor.isClient) {
      return;
    } // reset
    Throttle.resetSetup(); // config
    Throttle.setCollection(new Mongo.Collection("foobar"));
    Throttle.setup(); // verify base config
    test.equal(Throttle.isSetup, true, 'after setup(): isSetup = true');
    test.equal(typeof Throttle.getCollection()._connection, "object", 'after setup(): getCollection()._connection should be an object');
  });
  Tinytest.add('Throttle - setCollectionName(null)', function(test) { // DEPRECATING SOON
    if (Meteor.isClient) {
      return;
    } // reset
    Throttle.resetSetup(); // config
    Throttle.setCollectionName(null);
    Throttle.setup(); // verify base config
    test.equal(Throttle.isSetup, true, 'after setup(): isSetup = true');
    test.equal(Throttle._collectionName, null, 'after setup(): _collectionName = null');
    test.equal(Throttle.getCollection()._connection, null, 'after setup(): getCollection()._connection = null');
  });
  Tinytest.add('Throttle - setCollectionName("foobar2")', function(test) { // DEPRECATING SOON
    if (Meteor.isClient) {
      return;
    } // reset
    Throttle.resetSetup(); // config
    Throttle.setCollectionName("foobar2");
    Throttle.setup(); // verify base config
    test.equal(Throttle.isSetup, true, 'after setup(): isSetup = true');
    test.equal(Throttle._collectionName, "foobar2", 'after setup(): _collectionName = "foobar2"');
    test.equal(typeof Throttle.getCollection()._connection, "object", 'after setup(): getCollection()._connection should be an object');
  });
  Tinytest.add('Throttle - keyScope', function(test) { // mockery
    var userIdFunc = Meteor.userId;
    Meteor.userId = function() {
      return 'throttleTinyTestMockUserId';
    };
    var scope = Throttle.scope;
    Throttle.setScope('global');
    test.equal(Throttle.keyScope('mykey'), 'mykey');
    Throttle.setScope('user');
    test.equal(Throttle.keyScope('mykey'), 'mykey_u_throttleTinyTestMockUserId'); // revert mockery
    Meteor.userId = userIdFunc;
    Throttle.setScope(scope);
  });
  Tinytest.add('Throttle - checkThenSet', function(test) { // reset
    Throttle.resetSetup();
    test.equal(Throttle.isSetup, false, 'after setup(): isSetup = true'); // config
    Throttle.setCollection(new Mongo.Collection(null));
    Throttle.setup();
    Throttle._collection.remove({}); // tests
    test.isTrue(Throttle.checkThenSet('tinytest-checkThenSet', 1, 1000), 'checkThenSet: first time = true');
    test.isFalse(Throttle.checkThenSet('tinytest-checkThenSet', 1, 1000), 'checkThenSet: second time = false (1 allowed)');
    test.isTrue(Throttle.checkThenSet('tinytest-checkThenSet', 2, 1000), 'checkThenSet: second time, try 2 = true (2 allowed)');
    test.isFalse(Throttle.checkThenSet('tinytest-checkThenSet', 2, 1000), 'checkThenSet: third time = false (2 allowed)');
    test.isFalse(Throttle.checkThenSet('tinytest-checkThenSet', 2, 1000), 'checkThenSet: third time = false (2 allowed)');
  });
  Tinytest.add('Throttle - check', function(test) { // reset
    Throttle.resetSetup();
    test.equal(Throttle.isSetup, false, 'after setup(): isSetup = true'); // config
    Throttle.setCollection(new Mongo.Collection(null));
    Throttle.setup(); // mock
    var now = new Date;
    var expireEpoch = now.getTime() + 100; // 100 ms in the future
    Throttle._collection.remove({});
    Throttle._collection.insert({
      key: 'tinytest-check',
      expire: expireEpoch
    }); // verify check
    test.isTrue(Throttle.check('tinytest-checkbadkey'), 'check: no results found = pass');
    test.isFalse(Throttle.check('tinytest-check', 1), 'check: found 1, allowed 1 = fail');
    test.isFalse(Throttle.check('tinytest-check'), 'check: auto-allowed = 1');
    test.isTrue(Throttle.check('tinytest-check', 2), 'check: found 1, allowed 2 = pass'); // -- add another --
    Throttle._collection.insert({
      key: 'tinytest-check',
      expire: expireEpoch
    });
    test.isFalse(Throttle.check('tinytest-check', 2), 'check: found 2, allowed 2 = fail');
    test.isTrue(Throttle.check('tinytest-check', 3), 'check: found 2, allowed 3 = pass'); // -- add an expire record, doesn't count --
    Throttle._collection.insert({
      key: 'tinytest-check',
      expire: expireEpoch - 200 // 100 ms in the past
    });
    test.isTrue(Throttle.check('tinytest-check', 3), 'check: found 2 (one in the past, not found), allowed 3 = pass');
  });
  Tinytest.add('Throttle - purge', function(test) { // reset
    Throttle.resetSetup(); // config
    Throttle.setCollection(new Mongo.Collection(null));
    Throttle.setup();
    Throttle._collection.remove({}); // mock
    var now = new Date;
    var expireEpoch = now.getTime(); // now
    Throttle._collection.insert({
      key: 'tinytest-purge',
      expire: expireEpoch - 1100 // 1.1 sec in the past
    });
    Throttle._collection.insert({
      key: 'tinytest-purge',
      expire: expireEpoch + 1100 // 1.1 sec in the future
    });
    test.equal(Throttle._collection.find({}).count(), 2, 'before purge: should be 2 records (past and future)');
    Throttle.purge();
    test.equal(Throttle._collection.find({}).count(), 1, 'after purge: should be 1 record left (in the future)');
  });
  Tinytest.add('Throttle - epoch', function(test) {
    var now = new Date;
    var expireEpoch = now.getTime();
    test.isTrue((Throttle.epoch() - expireEpoch) < 2, 'epoch() within 2 ms of "now"');
    test.isTrue((expireEpoch - Throttle.epoch()) < 2, 'epoch() within 2 ms of "now" (future)');
  });
  Tinytest.add('Throttle - checkAllowedMethods', function(test) {
    var isMethodhelpersAllowed = Throttle.isMethodhelpersAllowed;
    Throttle.setMethodsAllowed(true);
    test.isTrue(Throttle.isMethodhelpersAllowed, 'config correct = true');
    test.isTrue(Throttle.checkAllowedMethods(), 'checkAllowedMethods() should be true');
    Throttle.setMethodsAllowed(false);
    test.isFalse(Throttle.isMethodhelpersAllowed, 'config correct = false');
    /* throws Meteor.Error(403)... test for it?       test.isFalse(       Throttle.checkAllowedMethods(),       'checkAllowedMethods() should be false'       );       */ // revert
    Throttle.isMethodhelpersAllowed = isMethodhelpersAllowed;
  });
  Tinytest.add('Throttle - performance Mongo.Collection("throttle_perf")', function(test) { // reset
    Throttle.resetSetup(); // config (use default setup)
    Throttle._collectionName = "throttle_perf";
    Throttle.setup();
    Throttle._collection.remove({});
    for (i = 0; i < 100000; i++) { // cehck then set X times... most will fail, but still doing WORK on the DB the whole time
      Throttle.checkThenSet('tinytest-checkThenSet', 2, 100);
    }
    test.isFalse(Throttle.checkThenSet('tinytest-checkThenSet', 1, 100), 'checkThenSet: should return false');
  });
  Tinytest.add('Throttle - performance Mongo.Collection(null)', function(test) { // reset
    Throttle.resetSetup(); // config
    Throttle.setCollection(new Mongo.Collection(null));
    Throttle.setup();
    Throttle._collection.remove({});
    for (i = 0; i < 100000; i++) { // cehck then set X times... most will fail, but still doing WORK on the DB the whole time
      Throttle.checkThenSet('tinytest-checkThenSet', 2, 100);
    }
    test.isFalse(Throttle.checkThenSet('tinytest-checkThenSet', 1, 100), 'checkThenSet: should return false');
  });
}