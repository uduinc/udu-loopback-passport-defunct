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
		if ( _.has( passportStrategyModules, strategyName ) && uduStrategyHandler[strategyName] )
		{
			if ( strategyName === 'local' )
			{
				console.log( 'Using local strat.' );
				passport.use( ( new PassportStrategy( uduStrategyHandler[strategyName] ) ) );
			}
			else
			{
				console.log( 'Using third-party strat:', strategyName );
				passport.use( ( new PassportStrategy( authProviders[strategyName], uduStrategyHandler[strategyName] ) ) );
			}
		}
	});
};

module.exports = UduPassport;