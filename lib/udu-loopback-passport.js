//------------------------------------------------------------------------------
// Requirements and Declarations
//------------------------------------------------------------------------------
var _ = require( 'lodash' );
var passport = require( 'passport' );
var passportStrategyModules = 
{
	local   	: require( 'passport-local' ).Strategy,
	facebook	: require( 'passport-facebook' ).Strategy,
	google  	: require( 'passport-google-oauth' ).OAuth2Strategy,
	twitter 	: require( 'passport-twitter' ).Strategy
};

var UduStrategyHandler = require( './strategies.js' );
var authProviders = require( './auth-providers.json' );

/**
 * The passport configurator
 * @param {Object} app The LoopBack app instance
 * @returns {UduPassport}
 * @constructor
 * @class
 */
var UduPassport = function ( app ) 
{
	if ( !(this instanceof UduPassport ) ) 
	{
		return new UduPassport(app);
	}
	this.app = app;
};

UduPassport.prototype.init = function ( )
{
	var self = this;

	self.app.use( passport.initialize() );

	var uduStrategyHandler = new UduStrategyHandler( self.app );

	_.forOwn( passportStrategyModules, function ( PassportStrategy, strategyName )
	{
		if ( uduStrategyHandler[strategyName] )
		{
			// Local is not being used atm; see strategies.js for details.
			if ( strategyName === 'local' )
			{
				console.log( 'Using local strat.' );
				passport.use( ( new PassportStrategy( uduStrategyHandler[strategyName] ) ) );
			}
			else
			{
				console.log( 'Using third-party strat:', strategyName );
				passport.use( ( new PassportStrategy( authProviders[strategyName], uduStrategyHandler[strategyName] ) ) );
				self.addPassportEndpointsForProvider( authProviders[strategyName], strategyName );
			}
		}
	});
};

UduPassport.prototype.addPassportEndpointsForProvider = function ( providerObj, providerName )
{
	var self = this;
	var options = providerObj['options'] || {};

	// This endpoint is the link people are sent to when they press the 'Login with Facebook/Google/Twitter' buttons
	console.log( '\tGenerating endpoint: /auth/' + providerName );
	console.log( 'options = ', options );
	self.app.get(
		'/auth/' + providerName,
		passport.authenticate( providerName, options ),
		function ( req, res ) { res.send( 202, 'hi' )} // The request will be redirected so this will never be called.
	);	

	// The auth provider (again, Facebook/Google etc) will call this endpoint when the user has logged in over there
	// and provided udu permission to use their information
	console.log( '\tGenerating endpoint: /auth/' + providerName + '/callback/' );
	self.app.get(
		'/auth/' + providerName + '/callback/',
		passport.authenticate( providerName, options ),
		function ( req, res )
		{
			// Successful authentication
			console.log( 'Successfully authenticated.' );

			// At this point, we've logged the member in [and/or registered them], so we respond with an authToken or error.
		}
	);				
};

module.exports = UduPassport;