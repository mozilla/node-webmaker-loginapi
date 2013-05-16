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


/**
 * A Fake Login server (i.e., Fogin). The idea is to simulate MongoDB
 * while still retaining the routes and internal logic.
 *
 * This module exposes two functions, `start` and `stop`. These are used
 * to control an instance of Fogin. The `start` function takes two args:
 *
 *   Fogin.start( options, callback );
 *
 * where `options` should have a username, password, and port.  The username
 * and password pair are used for HTTP basic auth. You can also provide an
 * array of logins, with data for users to be insterted into the fake login
 * server:
 *
 * Fogin.start({
 *   port: 5555,
 *   username: "someone",
 *   password: "secret",
 *   logins: [
 *     {
 *       email: "admin@somewhere.com",
 *       subdomain: "admin",
 *       fullName: "An Admin",
 *       isAdmin: true
 *     },
 *     {
 *       email: "not-admin@somewhere.com",
 *       subdomain: "notadmin",
 *       fullName: "Not Admin",
 *       isAdmin: false
 *     }
 *   ]
 * }, function() { ... });
 *
 */
var express = require( "express" ),
    server,
    loginStore = {};

// Simulate login store. If you want to add items, do it in start().
function createLogin( user ) {
  var now = Date.now();
  loginStore[ user.email ] = {
    _id: user.email,
    email: user.email,
    subdomain: user.subdomain || "default",
    fullName: user.fullName || "default",
    displayName: user.fullName || "default",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    isAdmin: !!user.isAdmin,
    isSuspended: user.isSuspended === true,
    sendNotifications: user.sendNotifications === true,
    sendEngagements: user.sendEngagements === true
  };
}

module.exports = {
  start: function( options, callback ) {
    options = options || {};
    options.username = options.username || "username";
    options.password = options.password || "password";
    callback = callback || function(){};

    var port = options.port || 5234,
        app = express(),
        defaultLogin = {
          email: "default@webmaker.org",
          subdomain: "subdomain",
          fullName: "John Smith",
          isAdmin: true
        },
        logins = options.logins || [ defaultLogin ],
        basicAuth = express.basicAuth( function ( username, password ) {
          return (username === options.username && password === options.password);
        });

    app.use( express.logger( "dev" ) );
    app.use( express.bodyParser() );

    // App GET USER
    app.get( '/user/:id', basicAuth, function ( req, res ) {
      var id = req.params.id,
          login = loginStore[ id ];

      if ( !login ) {
        res.json( 404, { error: "User not found for ID: " + id, user: null } );
      } else {
        res.json({ user: login });
      }
    });

    // App isAdmin
    app.get( '/isAdmin', basicAuth, function ( req, res ) {
      var id = req.query.id,
          login = loginStore[ id ];

      if ( !login ) {
        res.json( 404, { error: "User not found for ID: " + id, user: null } );
      } else {
        res.json({ error: null, isAdmin: login.isAdmin });
      }
    });

    server = app.listen( port, function( req, res ) {
      logins.forEach( function( user ) {
        createLogin( user );
      });
      callback();
    });
  },

  stop: function( callback ) {
    callback = callback || function(){};
    if ( !server ) {
      return;
    }
    server.close( function() {
      server = null;
      callback();
    });
  }
};
