/**
 * Created by Sarah on 11/11/2014.
 */
var googleapis = require('googleapis'),
    OAuth2Client = googleapis.auth.OAuth2,
    cal = googleapis.calendar('v3'),
    oauth2 = googleapis.oauth2('v2'),
    plus = googleapis.plus('v1'),
    client = '44739654617-smpi9pegp9t0qi8tsdt9pri8ib472shk.apps.googleusercontent.com',
    secret = 'B-Yo_rAJAMSmZn3C3p1luiOG',
    redirect = 'http://localhost:3000/oauth2callback',
    auth_url = '',
    oauth2Client = new OAuth2Client(client, secret, redirect);

exports.ping = function() {
    console.log('pong');
};

auth_url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/calendar',
        'email'
    ]
});


//export all of the variables used for the google authentication process
exports.cal = cal;
exports.oauth = oauth2;
exports.client = oauth2Client;
exports.client.plus = plus;
exports.url = auth_url;


exports.refresh = function() {
    gapi.auth.authorize({
            'client_id': client,
             scope: [
                'https://www.googleapis.com/auth/plus.me',
                'https://www.googleapis.com/auth/calendar',
                'email'
             ],
            'cookie_policy': COOKIE_POLICY,
            'immediate': true
        },
        handleAuthResult
    );
}

function handleAuthResult () {
        console.log(gapi.auth.getToken())
        console.log(gapi.auth.getToken().accessToken)
        gapi.client.oauth2.userinfo.get().execute(function(resp) {
            checkEmail(resp) //resp = user! redo auth!
        })
}