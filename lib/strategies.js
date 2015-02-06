var _ = require( 'lodash' );

/**
 * Passport strategies for udu's instance of Loopback
 * @param {Object} app The LoopBack app instance
 * @returns {Strats}
 * @constructor
 * @class
 */
var Strats = function ( app ) 
{
    if ( !( this instanceof Strats ) ) 
    {
        return new Strats( app );
    }
    this.app = app;
};

// Do *NOT* try to use this atm. Use the /members/login endpoint if you're authing locally.
Strats.prototype.local = function( contact, password, done )
{
    var self = this;    
    console.log( '------Entering local( username, password, done )------' );
    console.log( 'username: ' + username );
    console.log( 'password: ' + password );

    /**
     * done: function ( err, user, failureMessage )
     * @err     - Should be null unless there was a server exception (db not available etc)
     * @user    - Should be the user if we had successful auth; see @message for details on failure
     * @message - Optional message upon failure, like so: { message: 'Invalid password' }; if this is passed, user should be false
     */

     // 1. Call Member.login
     // That's it.
    var memberModel = loopback.getModelByType( self.app.models.Member );
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

Strats.prototype.facebook = function ()
{
    var self = this;
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
Strats.prototype.google = function ( accessToken, refreshToken, profile, done )
{
    var self = this;
    console.log( '--Google--' );
    console.log( arguments );
};

Strats.prototype.twitter = function ()
{
    var self = this;
};

module.exports = Strats;