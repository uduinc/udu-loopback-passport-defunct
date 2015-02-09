#udu's Implementation of Passport for Loopback

***
***

##Google:


##Facebook:
* Note Re:SMS - Phone numbers in user profiles are unavailable via Facebook, see https://developers.facebook.com/blog/post/447/
* List of Permission Scopes: https://developers.facebook.com/docs/facebook-login/permissions/v2.2#reference

##Twitter:
* **Needs Passport Code Written**. Currently requires sessions because there is not an OAuth2 Passport module for Twitter. Since we don't use sessions, we'll just have to write that module (since Twitter _does_ support OAuth2) and we'll have Twitter as well.


## Overview of process with Passport provider (Google as example):

###User clicks on 'Login to Google' link
	-> /auth/google
		-> google's site
	-> /auth/google/callback with infos
		-> Is there a user with this account? Great, give them an access token
		-> No? Create an account with this info and then give them an access token.

***

##Details of main-api backend after /auth/provider/callback:

###User comes from Passport -> search for email in contacts
	-> If found:
		-> Has provider+providerToken?
			-> Update token if not matching
			-> Login 
			>>>>> POST back auth token
		-> No provider+providerToken?
			-> Add provider+providerToken
			-> Login
			>>>>> POST back auth token
	If not found:
		-> Create account with info provided
			(Contacts arr created with provider+providerToken)
		-> Login
		>>>>> POST back auth token