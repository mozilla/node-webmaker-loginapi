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
    Fogin = require( "./test/Fogin.js" );

/**
 *  Module.exports
 **/
module.exports = function ( app, rawUrl ) {
  if (!app) {
    throw new Error("webmaker-loginapi error: express app was not passed into function");
  }

  if (!rawUrl) {
    throw new Error("webmaker-loginapi error: URI was not passed into function");
  }

  var parsedUrl = require( "url" ).parse( rawUrl );

  if ( parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:" ) {
    throw new Error("webmaker-loginapi error: URI protocol must be 'https:' or 'http:'");
  }
  if ( !parsedUrl.auth || parsedUrl.auth.split(":").length != 2 ) {
    throw new Error("webmaker-loginapi error: authentication must be present in URI");
  }

  var authBits = parsedUrl.auth.split(":"),
      webmakerUrl = parsedUrl.href;
  authBits = {
    user: authBits[0],
    pass: authBits[1]
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
        if ( response.statusCode == 401 ) {
          return callback( "Authentication failed!" );
        }

        if ( error || body.error ) {
          return callback( error || body.error );
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
        if ( response.statusCode == 401 ) {
          return callback( "Authentication failed!" );
        }

        if ( error || body.error ) {
          return callback( error || body.error );
        }

        callback( null, body.isAdmin );
      });
    }
  }; // END LoginAPI

  /**
   * Routes declaration
   **/
  app.get( "/user/:userid", function( req, res ) {
    var personaUser = req.session.email;

    // Check for authenticated user
    if ( !personaUser ) {
      return res.json( 403, {
        status: "failed",
        reason: "authentication failure"
      });
    }

    loginAPI.getUser( personaUser, function( err, webmaker ) {
      // Error handling
      if ( err || !webmaker ) {
        return res.json( 404, {
          status: "failed",
          reason: ( err || "webmaker not found" )
        });
      }

      // Set session
      req.session.username = webmaker.username;
      return res.json( 200, {
        status: "okay",
        user: webmaker
      });            
    });
  });

  return {
    Fogin: Fogin,
    getUser: loginAPI.getUser,
    isAdmin: loginAPI.isAdmin
  };
};
