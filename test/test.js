/* 
  Copyright 2013 Mozilla Foundation
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var assert = require( 'assert' ),
    fork = require( 'child_process' ).fork,
    request = require( 'request' ),
    child,
    loginValid = require ( '../index.js' )("http://user:pass@localhost:8889"),
    loginInvalid = require ( '../index.js' )("http://user:Pass@localhost:8889"); 


function startServer( callback ) {
  // Spin-up the server as a child process
  child = fork( 'test/testServer.js', null, {} );
  child.on( 'message', function( msg ) {
    if ( msg === 'Started' ) {
      callback();
    }
  });
}

function stopServer() {
  child.kill();
}

describe( "getUser() method", function() {
  before( function( done ) {
    startServer( done );
  });

  after( function() {
    stopServer();
  });

  it( "should return the user object if the user exists", function ( done ) {
    loginValid.getUser( "foo@foo.com", function ( error, user ){
      assert.ok( !error );
      assert.strictEqual( user._id, "foo@foo.com" );
      done();
    });
  });

  it( "should return a specific error string if the user doesn't exist", function ( done ) {
    loginValid.getUser( "foo@bar.com", function ( error, user ){
      assert.ok( !!error );
      assert.equal( user, undefined );
      done();
    });
  });

  it( "should return a specific error string if the basicauth fails", function ( done ) {
    loginInvalid.getUser( "foo@foo.com", function ( error, user ){
      assert.equal( error, "Authentication failed!" );
      done();
    });
  });
}); 


describe( "isAdmin() method", function() {
  before( function( done ) {
    startServer( done );
  });

  after( function() {
    stopServer();
  });

  it( "should return true/false if the user exists", function ( done ) {
    loginValid.isAdmin( "foo@foo.com", function ( error, isAdmin ){
      assert.ok( !error );
      assert.strictEqual( typeof( isAdmin ), "boolean" );
      done();
    });
  });

  it( "should return an error string if the user doesn't exist", function ( done ) {
    loginValid.isAdmin( "foo@bar.com", function ( error, isAdmin ){
      assert.ok( !!error );
      assert.equal( isAdmin, undefined );
      done();
    });
  });

  it( "should return a specific error string if the basicauth fails", function ( done ) {
    loginInvalid.isAdmin( "foo@foo.com", function ( error, user ){
      assert.equal( error, "Authentication failed!" );
      done();
    });
  });
}); 
