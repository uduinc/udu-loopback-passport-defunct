//------------------------------------------------------------------------------
// Requirements and Declarations
//------------------------------------------------------------------------------
var _ = require( 'lodash' );
var loopback = require( 'loopback' );
var passport = require( 'passport' );
var passportStrategyModules = 
{
	local   	: require( 'passport-local' ).Strategy,
	facebook	: require( 'passport-facebook' ).Strategy,
	google  	: require( 'passport-google-oauth' ).OAuth2Strategy,
	twitter 	: require( 'passport-twitter' ).Strategy
};

var uduStrategyHandler = require( './strategies.js' );
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

	// self.app.use(express.session({ secret: 'keyboard cat' }));
  	self.app.use(passport.initialize());
  	self.app.use(passport.session());

	console.log( 'initing UduPassport. app = ', self.app );
	uduStrategyHandler.init( self.app, self.loginOrRegisterUser );

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
	options.session = false;

	// This endpoint is the link people are sent to when they press the 'Login with Facebook/Google/Twitter' buttons
	console.log( '\tGenerating endpoint: /auth/' + providerName );
	console.log( 'options = ', options );
	self.app.get(
		'/auth/' + providerName,
		passport.authenticate( providerName, options ),
		function ( req, res ) { res.send( 202, 'Redirection' )} // The request will be redirected to an external website, so this will never be called.
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
			console.log( 'Successfully authenticated. Retrieving accessToken.' );
			
			var accessTokenModel = loopback.getModelByType( self.app.models.accessToken );

			var sortFn = function ( a, b )
			{
				var dateA = new Date( a.created.toString() );
				var dateB = new Date( b.created.toString() );
				if ( dateA > dateB )
				{
					return 1;
				}
				if ( dateA < dateB )
				{
					return -1;
				}
				return 0;
			};
			accessTokenModel.find( 
				{ 
					where: 
					{ 
						memberId: req.user['id']
					} 
				}, 
				function ( err, tokenArr )
				{                                                                      
					// At this point, we've logged the member in [and/or registered them], so we respond with an authToken or error.
					console.log( err );
					tokenArr.sort( sortFn );
					console.log( tokenArr );
					if ( err || !tokenArr || !tokenArr.length )
					{
						res.send( 404, err || 'No user with this address is currently authorized.' );
					}
					else
					{
						// Use the last one because that's the most recently created (i.e. the one we created in strategies.js but were unable to pass along in req)
						res.send( 200, tokenArr[tokenArr.length - 1]['id'] );
					}
				}
			);
		}
	);				
};

UduPassport.prototype.findExternalUser = function ( externalEmails, platform, searchModel, cb )
{
	for ( var i = 0; i < arguments.length; i++ )
	{
		var arg = arguments[i];
		if ( !arg )
		{
			if ( typeof cb === 'function' )
			{
				return cb( '1+ invalid arguments to UduPassport.findExternalUser' );
			}
			else
			{
				return;
			}
		}
	}

	var recIdx = 0;
	var recursiveSearch = function ( idx, emails )
	{
		console.log( '--Top of recursiveSearch--' );
		console.log( 'idx =', idx );

		var currentEmail = emails[idx];
		if ( !currentEmail )
		{
			return cb( 'Not found.', null );
		}
		console.log( 'currentEmail = ', currentEmail );
	   searchModel.findOne(
			{
				where: { 'contacts.contact': currentEmail }
			},
			function ( err, user )
			{
				console.log( err );
				console.log( user );		
				if ( !err && user)
				{
					console.log( 'FOUND one: ', JSON.stringify( user, null, 4 ) );
					cb( null, { user: user, idx: idx } );
				}
				else if ( idx === emails.length - 1 )
				{
					cb( 'Contact DNE', null );
				}
				else
				{
					++idx;
					console.log( 'Calling next iteration. idx = ', idx );
					recursiveSearch( idx, emails );
				}
			}
		);
	};
	console.log( '--Starting recursiveSearch--' );
	console.log( 'emails = ', externalEmails );
	recursiveSearch( recIdx, externalEmails );
};

UduPassport.prototype.loginOrRegisterUser = function ( accessToken, profile, done )
{
	if ( !accessToken || !profile || !profile.emails || !profile.emails.length )
	{
		return done( 'Cannot login or register user without an accessToken and contact method' );
	}

	var self = this;

	console.log( '--Strats.loginOrRegisterUser--' );
	console.log( arguments );
	console.log( '--user stuff--' );

	var contacts = _.pluck( profile.emails, 'value' );
	console.log( JSON.stringify( contacts, null, 4 ) );

	// Facebook + Google both have this. Not sure about Twitter.
	var name =
	{
		first: profile['name']['givenName'],
		last: profile['name']['familyName']
	};
	var gender = profile.gender; // Atm only gathered from Facebook; investigate Google/Twitter.

	var memberModel = loopback.getModelByType( self.app.models.Member );
	var contactsArr = _.pluck( profile.emails, 'value' );
	self.findExternalUser( contactsArr, profile.provider, memberModel, function ( err, cbObj )
	{
		console.log( '--findExternalUser output--' );
		console.log( err );
		console.log( cbObj );
		if ( err )
		{
			done( err );
		}
		else if ( !cbObj )
		{
			// Create user object
		}
		else
		{
			var user = cbObj.user;
			var idx = cbObj.idx;

			// Check to see if it has the correct accountType and accessToken
			// if ( user.contacts[idx].accessType = 'external';
						// Call Member.login -- their Loopback accessToken will be created inside the login method (in members.js)
			memberModel.login( 
				{ contact: contact }, 
				function ( err2, token ) 
				{
					console.log( 'err2 = ', err2 );
					console.log( 'token = ', token );	
						
					// We can't pass this token with the request, so instead:
					// 	When this middleware is finished and we're back to the request handler in 
					// 	udu-loopback-passport.js, we query the database for the user's latest accessToken
					// 	and use that (it's a safe assumption that the one we create here is their latest)
					done( null, userObj );
				}
			);
		}		
	});    
};

module.exports = UduPassport;