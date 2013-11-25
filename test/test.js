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
    fakeExpress = {
      get: function() {},
      post: function() {}
    },
    loginModule = require( "../index.js" ),
    port = 5556,
    username = 'username',
    password = 'password',
    login = loginModule( fakeExpress, {
      loginURL: 'http://' + username + ':' + password + '@localhost:' + port,
      audience: 'http://localhost:' + port
    }),
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
    }, {
      email: "foo2@foo.com",
      username: "username2"
    }, {
      email: "foo3@foo.com",
      username: "username3"
    }, {
      email: "foo4@foo.com",
      username: "username4"
    }]
  }, done );
}

function stopServer( done ) {
  Fogin.stop( done );
}


describe( "getUserByEmail() method", function() {
  before( function( done ) {
    startServer( null, done );
  });

  after( function( done ) {
    stopServer( done );
  });

  it( "should return the user object if the user exists", function ( done ) {
    login.getUserByEmail( "foo@foo.com", function ( error, user ){
      assert.ok( !error );
      assert.strictEqual( user._id, "foo@foo.com" );
      done();
    });
  });

  it( "should return without args if the user doesn't exist", function ( done ) {
    login.getUserByEmail( "foo@bar.com", function ( error, user ){
      assert.ok( !error );
      assert.equal( user, undefined );
      done();
    });
  });
});

describe( "getUserById() method", function() {
  before( function( done ) {
    startServer( null, done );
  });

  after( function( done ) {
    stopServer( done );
  });

  it( "should return the user object if the user exists", function ( done ) {
    login.getUserById( "1", function ( error, user ){
      assert.ok( !error );
      assert.strictEqual( user._id, "foo@foo.com" );
      done();
    });
  });

  it( "should return without args if the user doesn't exist", function ( done ) {
    login.getUserById( "42", function ( error, user ){
      assert.ok( !error );
      assert.equal( user, undefined );
      done();
    });
  });
});

describe( "getUserByUsername() method", function() {
  before( function( done ) {
    startServer( null, done );
  });

  after( function( done ) {
    stopServer( done );
  });

  it( "should return the user object if the user exists", function ( done ) {
    login.getUserByUsername( "default", function ( error, user ){
      assert.ok( !error );
      assert.strictEqual( user._id, "foo@foo.com" );
      done();
    });
  });

  it( "should return without args if the user doesn't exist", function ( done ) {
    login.getUserByUsername( "fake_username", function ( error, user ){
      assert.ok( !error );
      assert.equal( user, undefined );
      done();
    });
  });
});

describe( "getUsernamesByEmails() method", function() {
  before( function( done ) {
    startServer( null, done );
  });

  after( function( done ) {
    stopServer( done );
  });

  it( "should turn the emails into usernames", function( done ) {
    var users = {
      "foo2@foo.com": "username2",
      "foo3@foo.com": "username3",
      "foo4@foo.com": "username4"
    };

    login.getUsernamesByEmails( Object.keys( users ), function ( error, usernamesMap ) {
      Object.keys( usernamesMap ).forEach( function( email ) {
        assert( email in users );
        assert( users[ email ] === usernamesMap[ email ].username );
      });
      done();
    });
  });
});

describe( "Auth failures", function() {
  before( function( done ) {
    startServer( { username: "wrong", password: "wrong", port: port }, done );
  });

  after( function( done ) {
    stopServer( done );
  });

  it( "should return a specific error string if the basicauth fails", function ( done ) {
    login.getUserByEmail( "foo@foo.com", function ( error, user ){
      assert.equal( error, "Authentication failed!" );
      done();
    });
  });
});

describe( "Good invocations", function() {
  it( "http://g:d@example.org should work", function( done ) {
    assert( loginModule( fakeExpress, { loginURL: "http://g:d@example.org" } ) );
    done();
  });

  it( "https://g:d@example.org should work", function( done ) {
    assert( loginModule( fakeExpress, { loginURL: "https://g:d@example.org" } ) );
    done();
  });

  it( "http://g:d@example.org/ should work", function( done ) {
    assert( loginModule( fakeExpress, { loginURL: "http://g:d@example.org/" } ) );
    done();
  });
});

describe( "Bad invocations", function() {
  it( "no express app should throw", function( done ) {
    assert.throws( function() {
      loginModule();
    }, /express app was not passed into function/ );
    done();
  });

  it( "no URI should throw", function( done ) {
    assert.throws( function() {
      loginModule( fakeExpress );
    }, /URI was not passed into function/ );
    done();
  });

  it( "http://example.org should throw", function( done ) {
    assert.throws( function() {
      loginModule( fakeExpress, { loginURL: "http://example.org" } );
    }, /authentication must be present in URI/ );
    done();
  });

  it( "g:d@example.org should throw", function( done ) {
    assert.throws( function() {
      loginModule( fakeExpress, { loginURL: "g:d@example.org" } );
    }, /URI protocol must be 'https:' or 'http:'/ );
    done();
  });

  it( "file://g:d@example.org should throw", function( done ) {
    assert.throws( function() {
      loginModule( fakeExpress, { loginURL: "file://g:d@example.org" } );
    }, /URI protocol must be 'https:' or 'http:'/ );
    done();
  });
});
