"use strict";
/*jshint node: true */  
var _ = require( 'lodash' );
var loopback = require( 'loopback' );
/**
 * Passport strategies for udu's instance of Loopback
 * @param {Object} app The LoopBack app instance
 * @returns {Strats}
 * @constructor
 * @class
 */
var Strats = Strats || {};

Strats.init = function ( app, sendToUduPassport )
{
   Strats.app = app;
   Strats.sendToUduPassport = sendToUduPassport;
};

// Do *NOT* try to use this atm. Use the /members/login endpoint if you're authing locally.
// We might not ever use the local Passport strat as it seems unncessary. Just keeping here in case.
Strats.local = function( contact, password, done )
{  

   console.log( '------Entering local( contact, password, done )------' );
   console.log( 'username: ' + contact );
   console.log( 'password: ' + password );

   /**
   * done: function ( err, user, failureMessage )
   * @err     - Should be null unless there was a server exception (db not available etc)
   * @user    - Should be the user if we had successful auth; see @message for details on failure
   * @message - Optional message upon failure, like so: { message: 'Invalid password' }; if this is passed, user should be false
   */

   // 1. Call Member.login
   // That's it.
   var memberModel = loopback.getModelByType( Strats.app.models.Member );
   memberModel.login( 
     { contact: contact, password: password }, 
     function ( err, token ) 
     {
         // What does its output look like for the different error cases (wrong pass vs. can't connect to db)?
         if ( err )
         {
             console.log( err );
             done( err );
         }
         else if ( token && token.id )
         {
             done( null, token.id );
         }
     }
   );
};

/*
--Facebook--
{ '0': 'CAAHZBRsFJI0wBAFEHIuTAuTFgJgZAOiSZCy4SPt4JVfGvzWdZCuES2B0ncA4S1GiqO4xy9O1LgZAZAZAwT2FcfdAIvKxUZBoJDJ1sRKUTLGwO3aZB9DD4nfHZBMZBidzChB2w2Rl1zhmfHDiKXznWpuCsbbYeZAi34Ij7LP5pGZCBMJtziEVMNV8uoDHGdctfZBW4jjpSmuUYUGLOWDzZA1ZC0jELZCcR',
  '1': undefined,
  '2': 
   { id: '10153093103481419',
     username: undefined,
     displayName: 'Bruce Clounie',
     name: 
      { familyName: 'Clounie',
        givenName: 'Bruce',
        middleName: undefined },
     gender: 'male',
     profileUrl: 'https://www.facebook.com/app_scoped_user_id/10153093103481419/',
     provider: 'facebook',
     _raw: '{"id":"10153093103481419","first_name":"Bruce","gender":"male","last_name":"Clounie","link":"https:\\/\\/www.facebook.com\\/app_scoped_user_id\\/10153093103481419\\/","locale":"en_US","name":"Bruce Clounie","timezone":-5,"updated_time":"2015-01-05T15:47:54+0000","verified":true}',
     _json: 
      { id: '10153093103481419',
        first_name: 'Bruce',
        gender: 'male',
        last_name: 'Clounie',
        link: 'https://www.facebook.com/app_scoped_user_id/10153093103481419/',
        locale: 'en_US',
        name: 'Bruce Clounie',
        timezone: -5,
        updated_time: '2015-01-05T15:47:54+0000',
        verified: true } },
  '3': [Function: verified] }
*/
Strats.facebook = function ( accessToken, refreshToken, profile, done )
{
   console.log( '--Facebook--' );
   console.log( arguments );
   console.log( JSON.stringify( profile, null, 4 ) );

   if ( !accessToken || !profile || !profile.emails || !profile.emails.length )
   {
     done( 'Invalid Authorization from Google' );
   }
   else
   {
     Strats.sendToUduPassport( accessToken, profile, done );        
   }    
};

/*
accessToken:    ya29.EQGpqeSLEjbqal4h4kMzQwbGyzsmxkI9hTWSGUSlSxdXYXCjttcHC4bj6EFsZU6jNBpKiChBAtz3Fg
refreshToken:   ?
profile:
{ 
    provider: 'google',
    id: '112419326058564057316',
    displayName: 'udu developer',
    name: { familyName: 'developer', givenName: 'udu' },
    emails: [ { value: 'developer@udu.nu' } ],
    _raw: '{\n "id": "112419326058564057316",\n "email": "developer@udu.nu",\n "verified_email": true,\n "name": "udu developer",\n "given_name": "udu",\n "family_name": "developer",\n "picture": "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg",\n "locale": "en",\n "hd": "udu.nu"\n}\n',
    _json: 
    { 
        id: '112419326058564057316',
        email: 'developer@udu.nu',
        verified_email: true,
        name: 'udu developer',
        given_name: 'udu',
        family_name: 'developer',
        picture: 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg',
        locale: 'en',
        hd: 'udu.nu' 
    } 
}
*/
Strats.google = function ( accessToken, refreshToken, profile, done )
{
   console.log( '--Google--' );
   console.log( arguments );
   console.log( JSON.stringify( profile.emails, null, 4 ) );

   if ( !accessToken || !profile || !profile.emails || !profile.emails.length )
   {
     done( 'Invalid Authorization from Google' );
   }
   else
   {
     Strats.sendToUduPassport( accessToken, profile, done );        
   }
};

Strats.twitter = function ( token, tokenSecret, profile, done )
{
   console.log( '--Twitter--' );
   console.log( arguments );
   console.log( JSON.stringify( profile, null, 4 ) );

   done( 'Sorry, Twitter is not supported at the moment.' );    
};

module.exports = Strats;
