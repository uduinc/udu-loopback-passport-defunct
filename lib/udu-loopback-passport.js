//------------------------------------------------------------------------------
// Requirements and Declarations
//------------------------------------------------------------------------------
var _ 						= require( 'lodash' );

var passport            = require( 'passport' );

var PassportStrategies = 
{
	local   	: require( 'passport-local' ).Strategy,
	facebook	: require( 'passport-facebook' ).Strategy,
	google  	: require( 'passport-google' ).Strategy,
	twitter 	: require( 'passport-twitter' ).Strategy
};
var UduStrategyHandler = require( './strategies.js' );
var providers = require( './auth-providers.json' );

module.exports = UduPassport

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

	var strategies = new UduStrategyHandler( self.app );

	_.own( PassportStrategies, function ( PassportStrategy, strategyName )
	{
		if ( _.has( PassportStrategies, strategyName ) && _.has( UduStrategyHandler, strategyName ) )
		{
			if ( strategyName === 'localStrat' )
			{
				passport.use( ( new PassportStrategy( UduStrategyHandler[strategyName] ) ) );
			}
			else
			{
				passport.use( ( new PassportStrategy( strategyName, UduStrategyHandler[strategyName] ) ) );
			}
		}
	});
};