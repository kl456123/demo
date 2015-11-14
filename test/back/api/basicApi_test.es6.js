require('ligle-engine')({
  loggerLevel:'INFO',
  odm:{
    server:'localhost/demo-test',
  },
});
var supertest = require("supertest");
var should = require("chai").should();
require('mocha-generators').install();

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:4000/rest/basic/");

describe("API Test: Basic",function(){
  it("Delete All",function(done){
    var sendObj = {};
    sendObj.options = {
      query:{},
    };
    server
      .delete('')
      .send(sendObj)
      .expect("Content-type",/json/)
      .expect(200)
      .end(function(err,res){
        res.status.should.equal(200);
        should.not.exist(err);
        res.body.status.should.equal('success');
        done();
      });
  })

  it("Create An Item ",function(done){
    var sendObj = {};
    sendObj.options = {
    };
    sendObj.data = {
      id:'123',
      name:'lx',
    };
    server
      .post('')
      .send(sendObj)
      .expect("Content-type",/json/)
      .expect(200)
      .end(function(err,res){
        res.status.should.equal(200);
        should.not.exist(err);
        res.body.status.should.equal('success');
        done();
      });
  });

  it("Get An Item ",function(done){
    var sendObj = {};
    sendObj.options = {
      query:{id:'123'},
    };
    server
      .get('')
      .send(sendObj)
      .expect("Content-type",/json/)
      .expect(200)
      .end(function(err,res){
        res.status.should.equal(200);
        should.not.exist(err);
        res.body.value.id.should.equal('123');
        res.body.status.should.equal('success');
        done();
      });
  });

  it("Update An Item ",function(done){
    var sendObj = {};
    sendObj.options = {
      query:{id:'123'},
    };
    sendObj.data = {
      id:'3333',
      name:'hahaha',
    };
    server
      .put('')
      .send(sendObj)
      .expect("Content-type",/json/)
      .expect(200)
      .end(function(err,res){
        res.status.should.equal(200);
        should.not.exist(err);
        res.body.value.id.should.equal('3333');
        res.body.status.should.equal('success');
        done();
      });
  });

  it("Get Updated Item ",function(done){
    var sendObj = {};
    sendObj.options = {
      query:{id:'3333'},
    };
    server
      .get('')
      .send(sendObj)
      .expect("Content-type",/json/)
      .expect(200)
      .end(function(err,res){
        res.status.should.equal(200);
        should.not.exist(err);
        res.body.value.id.should.equal('3333');
        res.body.status.should.equal('success');
        done();
      });
  });

});
