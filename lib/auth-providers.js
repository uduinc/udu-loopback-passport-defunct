module.exports = 
{
    "local":
    {
        "usernameField": "contact",
        "passwordField": "password"
    },
    "facebook":
    {
        "clientID": 561054820672332,
        "clientSecret": "0e6707f9e9bbdf9e5fccb65213777d71",
        "callbackURL": "http://udumeetapi-dev.elasticbeanstalk.com/auth/facebook/callback",
        "options":
        {
            "scope":
            [
                "email"               
            ]
        }        
    },
    "google":
    {
        "clientID": "859142096533-ek2uj6jsc4696bmgki1nf6c7q7dhchsf.apps.googleusercontent.com",
        "clientSecret": "pLgZ0mWu8x3DmpQ9LsJOXILh",
        "callbackURL": "http://udumeetapi-dev.elasticbeanstalk.com/auth/google/callback",
        "options":
        {
            "scope":
            [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email"                
            ]
        }        
    },
    "twitter":
    {
        "consumerKey": "ZOmhPTsm7OHCkfG7uicrh5T3r",
        "consumerSecret": "vYu9JMkFtjSFXc3DKIJSYiXzkN62MmZxi7lMhzPlKCcUBDAw0Z",
        "callbackURL": "http://udumeetapi-dev.elasticbeanstalk.com/auth/twitter/callback"
    }
}