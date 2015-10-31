'use strict';

var requireHelper = require('../require-helper');
var ligle = require('ligle-engine')({
  loggerLevel:'INFO',
  odm:{
    server:'localhost/demo-test',
  },
});

require('chai').should();
require('mocha-generators').install();

var Basic = requireHelper('basic');


describe('Backend Unit Test', function () {
  before(function * () {
    ligle.odm.connect();
  });
  beforeEach(function * () {
    yield* Basic.remove();
  });
  it('demo Test', function * () {
    let post = new Basic({
      title: 'Node.js with --harmony rocks!',
      body: 'Long post body',
      author: {
        name: 'John Doe',
      },
    });
    yield post.save();

    let posts = yield Basic.find();
    posts.length.should.equal(1);
    posts[0].get('title').should.equal('Node.js with --harmony rocks!');

    post.set('title', 'Post got a new title!');
    yield post.save();

    posts = yield Basic.find();
    posts.length.should.equal(1);
    posts[0].get('title').should.equal('Post got a new title!');
  });
  after(function () {
    ligle.odm.disconnect();
  });
});
