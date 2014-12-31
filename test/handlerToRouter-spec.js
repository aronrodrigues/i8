(function () {
	'use strict';

  var chai = require('chai');
  var expect = chai.expect;
  var handlerToRouter = require('../main/handlerToRouter');
  var sinon = require('sinon');
  var sandbox = sinon.sandbox.create();
  var express = require('express');

  describe('handlerToRouter()', function () {

 		var fakeFunction = function () {};

    beforeEach(function (done) {
     	sandbox.stub(express, 'Router', function () {
     		return {
		 			get: sandbox.spy(),
		 			post: sandbox.spy(),
		 			put: sandbox.spy(),
		 			delete: sandbox.spy(),
		 			all: sandbox.spy()
		 		};
     	});
     	done();
    });

    afterEach(function (done) {
      sandbox.restore();
      done();
    });

    describe('simple call', function () {
      it('returns a router', function (done) {
        var handler = {
          get: [ { path: '/', before: fakeFunction, action: fakeFunction } ],
          post: [ { path: '/', action: fakeFunction } ],
          put: [ { path: '/', action: fakeFunction } ],
          delete: [ { path: '/', action: fakeFunction } ],
          all: [ { path: '/', action: fakeFunction } ]
        };
        var router = handlerToRouter(handler);
        expect(router.__handler).to.be.deep.equal(handler);
        expect(router.get.calledOnce).to.be.true;
        expect(router.get.getCall(0).args.length).to.be.equals(3);
        expect(router.get.getCall(0).args[0]).to.be.equal('/');
        expect(router.get.getCall(0).args[1]).to.be.equal(fakeFunction);
        expect(router.get.getCall(0).args[2]).to.be.equal(fakeFunction);
        expect(router.post.calledOnce).to.be.true;
        expect(router.post.getCall(0).args.length).to.be.equals(2);
        expect(router.put.calledOnce).to.be.true;
        expect(router.delete.calledOnce).to.be.true;
        expect(router.all.calledOnce).to.be.true; 
        done();
      })
    });

		describe('parcial call', function () {
      it('returns a router', function (done) {
        var handler = {
          get: [ { path: '/', before: fakeFunction, action: fakeFunction } ],
          put: [ { path: '/', action: fakeFunction } ]
        }
        var router = handlerToRouter(handler);
        expect(router.get.calledOnce).to.be.true;
        expect(router.get.getCall(0).args.length).to.be.equals(3);
        expect(router.get.getCall(0).args[0]).to.be.equal('/');
        expect(router.get.getCall(0).args[1]).to.be.equal(fakeFunction);
        expect(router.get.getCall(0).args[2]).to.be.equal(fakeFunction);
        expect(router.put.calledOnce).to.be.true;
        expect(router.post.called).to.be.false;
        expect(router.delete.called).to.be.false;
        expect(router.all.called).to.be.false; 
        done();
      })
    });

    describe('multiple calls on same method', function () {
      it('returns a router', function (done) {
        var handler = {
          get: [ 
            { path: '/', before: fakeFunction, action: fakeFunction },
            { path: '/:id', before: fakeFunction, action: fakeFunction } ]
        };
        var router = handlerToRouter(handler);;
        expect(router.__handler).to.be.deep.equal(handler);
        expect(router.get.callCount).to.be.equals(2);
        expect(router.get.getCall(0).args[0]).to.be.equal('/');
        expect(router.get.getCall(1).args[0]).to.be.equal('/:id');
        expect(router.put.called).to.be.false;
        expect(router.post.called).to.be.false;
        expect(router.delete.called).to.be.false;
        expect(router.all.called).to.be.false; 
        done();
      })
    });

    describe('wrong method', function () {
      it('throws error', function (done) {
        expect(function () { handlerToRouter({
        		get: [ 
        		  { path: '/', before: fakeFunction, action: fakeFunction },
        		  { path: '/:id', before: fakeFunction, action: fakeFunction } ],
        	  dont: [ {path: '/doIt', action: fakeFunction } ]
        	}
        	)}).to.throws(Error);
        done();
      })
    });

    describe('getRoute()', function () {

      var handler = null;
      var router = null;

      beforeEach(function (done) {
        handler = {
            get: [ { path: '/:id', before: fakeFunction, action: fakeFunction } ],
            post: [ { path: '/', action: fakeFunction } ],
            put: [ { path: '/', action: fakeFunction } ],
            delete: [ { path: '/', action: fakeFunction } ],
            all: [ { path: '/', action: fakeFunction } ],
          };
        router = handlerToRouter(handler);
        done();
      });

      describe('existing get route', function () {
        it('returns the route', function (done) {
          var route = router.__handler.getRoute('get', '/:id');
          expect(route.path).to.be.equals('/:id');
          expect(route.before).to.be.equals(fakeFunction);
          expect(route.action).to.be.equals(fakeFunction);
          done();
        });
      });

      describe('existing post route', function () {
        it('returns the route', function (done) {
          var route = router.__handler.getRoute('post', '/');
          expect(route.path).to.be.equals('/');
          expect(route.before).to.be.undefined;
          expect(route.action).to.be.equals(fakeFunction);
          done();
        });
      });

      describe('not existing route', function () {
        it('returns the route', function (done) {
          var route = router.__handler.getRoute('get', '/showMe');
          expect(route).to.be.null;
          done();
        });
      });

      describe('invalid method', function () {
        it('returns the route', function (done) {
          var route = router.__handler.getRoute('jump', '/');
          expect(route).to.be.null;
          done();
        });
      });

    });

  });

})();