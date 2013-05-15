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
    port = 5556,
    username = 'username',
    password = 'password',
    login = require ( '../index.js' )( 'http://' + username + ':' + password + '@localhost:' + port ),
    Fogin = login.Fogin;

function startServer( options, done ) {
  options = options || { username: username, password: password, port: port };
  Fogin.start({
    port: options.port,
    username: options.username,
    password: options.password,
    logins: [{
      email: 'foo@foo.com',
      isAdmin: true
    }]
  }, done );
}

function stopServer() {
  Fogin.stop();
}


describe( "getUser() method", function() {
  before( function( done ) {
    startServer( null, done );
  });

  after( function() {
    stopServer();
  });

  it( "should return the user object if the user exists", function ( done ) {
    login.getUser( "foo@foo.com", function ( error, user ){
      assert.ok( !error );
      assert.strictEqual( user._id, "foo@foo.com" );
      done();
    });
  });

  it( "should return a specific error string if the user doesn't exist", function ( done ) {
    login.getUser( "foo@bar.com", function ( error, user ){
      assert.ok( !!error );
      assert.equal( user, undefined );
      done();
    });
  });
});


describe( "isAdmin() method", function() {
  before( function( done ) {
    startServer( null, done );
  });

  after( function() {
    stopServer();
  });

  it( "should return true/false if the user exists", function ( done ) {
    login.isAdmin( "foo@foo.com", function ( error, isAdmin ){
      assert.ok( !error );
      assert.strictEqual( typeof( isAdmin ), "boolean" );
      done();
    });
  });

  it( "should return an error string if the user doesn't exist", function ( done ) {
    login.isAdmin( "foo@bar.com", function ( error, isAdmin ){
      assert.ok( !!error );
      assert.equal( isAdmin, undefined );
      done();
    });
  });
});


describe( "Auth failures", function() {
  before( function( done ) {
    startServer( { username: "wrong", password: "wrong", port: port }, done );
  });

  after( function() {
    stopServer();
  });

  it( "should return a specific error string if the basicauth fails", function ( done ) {
    login.isAdmin( "foo@foo.com", function ( error, user ){
      assert.equal( error, "Authentication failed!" );
      done();
    });
  });

  it( "should return a specific error string if the basicauth fails", function ( done ) {
    login.getUser( "foo@foo.com", function ( error, user ){
      assert.equal( error, "Authentication failed!" );
      done();
    });
  });
});