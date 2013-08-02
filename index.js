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
 * Global requires
 **/
var request = require( "request" ),
    Fogin = require( "./test/Fogin.js" ),
    persona = require( "express-persona" );

/**
 *  Module.exports
 **/
module.exports = function ( app, options ) {
  options = options || {};

  if ( !app ) {
    throw new Error("webmaker-loginapi error: express app was not passed into function");
  }

  if ( !options.loginURL ) {
    throw new Error("webmaker-loginapi error: URI was not passed into function");
  }

  var parsedUrl = require( "url" ).parse( options.loginURL );

  if ( parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:" ) {
    throw new Error( "webmaker-loginapi error: URI protocol must be 'https:' or 'http:'" );
  }
  if ( !parsedUrl.auth || parsedUrl.auth.split( ":" ).length != 2 ) {
    throw new Error( "webmaker-loginapi error: authentication must be present in URI" );
  }

  var authBits = parsedUrl.auth.split( ":" ),
      webmakerUrl = parsedUrl.href;

  authBits = {
    user: authBits[ 0 ],
    pass: authBits[ 1 ]
  };

  var loginAPI = {
    getUser: function ( id, callback ) {
      request({
        auth: {
          username: authBits.user,
          password: authBits.pass,
          sendImmediately: false
        },
        method: "GET",
        uri: webmakerUrl + "user/" + id,
        json: true
      }, function ( error, response, body ) {
        // Shallow error check
        if ( error ) {
          return callback( error );
        }

        // User account wasn't found. Treat differently
        if ( response.statusCode === 404 ) {
          return callback();
        }

        // Deep error check
        if ( body && body.error ) {
          return callback( body.error );
        }

        // Auth error check
        if ( response.statusCode == 401 ) {
          return callback( "Authentication failed!" );
        }

        callback( null, body.user );
      });
    },
    isAdmin: function ( id, callback ) {
      request({
        auth: {
          username: authBits.user,
          password: authBits.pass,
          sendImmediately: false
        },
        method: "GET",
        uri: webmakerUrl + "isAdmin?id=" + id,
        json: true
      }, function ( error, response, body ) {
        // Shallow error check
        if ( error ) {
          return callback( error );
        }

        // Deep error check
        if ( body && body.error ) {
          return callback( body.error );
        }

        // Auth check
        if ( response.statusCode == 401 ) {
          return callback( "Authentication failed!" );
        }

        callback( null, body.isAdmin );
      });
    }
  };

  persona( app, {
    verifyResponse: function( error, req, res, email ) {
      if ( error ) {
        return res.json( { status: "failure", reason: error } );
      }

      loginAPI.getUser( email, function( err, webmaker ) {

        if ( err ) {
          return res.json( 500, {
            status: "failure",
            reason: err,
            email: email
          });
        }

        if ( !webmaker ) {
          return res.json( 404, {
            status: "failure",
            reason: "webmaker not found",
            email: email
          });
        }

        // Set session
        req.session.username = webmaker.username;
        if ( options.verifyResponse ) {
          options.verifyResponse( res, {
            status: "okay",
            user: webmaker,
            email: email
          });
          return;
        }

        return res.json( 200, {
          status: "okay",
          user: webmaker,
          email: email
        });
      });
    },
    logoutResponse: function( error, req, res ) {
      delete req.session.username;

      if ( error ) {
        return res.json( { status: "failure", reason: error } );
      }

      res.json( { status: "okay" } );
    },
    audience: options.audience,
    middleware: options.middleware
  });

  return {
    Fogin: Fogin,
    getUser: loginAPI.getUser,
    isAdmin: loginAPI.isAdmin
  };
};
