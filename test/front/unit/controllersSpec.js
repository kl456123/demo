'use strict';
/*jshint undef:false*/

/* mocha specs for controllers go here */
describe('PhoneCat controllers', function() {

  describe('PhoneListCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(module('phonecatApp'));
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/phones.json').
        respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

      scope = $rootScope.$new();
      ctrl = $controller('PhoneListCtrl', {$scope: scope});
    }));

    it('"phones" model with 2 phones fetched from xhr',function() {
      should.not.exist(scope.phones);
      $httpBackend.flush();
      expect(scope.phones).to.deep.equal(
        [{name: 'Nexus S'},{name: 'Motorola DROID'}]
      );
    });


    it('should set the default value of orderProp model', function() {
      expect(scope.orderProp).to.equal('age');
    });
  });


  describe('PhoneDetailCtrl', function(){
  });
});
