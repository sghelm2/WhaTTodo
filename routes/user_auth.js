/**
 * Created by Sarah on 11/11/2014.
 */
var util = require('util'),
    gapi = require('../gapi'),
    ObjectID = require('mongodb').ObjectID,
    gcal = require('google-calendar');

/*****************************USER**************************/

/*
 Gets access token and saves user and token to the users collection.
 */
exports.oauth2 = function(req, res) {
    var code = req.query.code;
    gapi.client.getToken(code, function (err, tokens) {
        if(err) console.log("error getting token: " + err.message);
        var objectId = new ObjectID;
        gapi.client.credentials = tokens;
        console.log(util.inspect(tokens, false, null));
        console.log(Object.keys(tokens));
        google_calendar = new gcal.GoogleCalendar(tokens.access_token);
        getData(function(error, url, name, imgurl) {

            if (error) console.log("error getting data: " + error.message);
            //if there is not already a user with that url in the database!!
            req.db.users.findOne({userurl: url}, function (error, user) {
                if (error) console.log(error.message);
                if (!user) {
                    req.db.users.save({
                        userurl: url,
                        tasks: [],
                        profile: {
                            user: name,
                            imgurl: imgurl,
                            tokens: tokens
                        }
                    }, function (error, new_user) {
                        if (error) {
                            console.log(error.message);
                        }
                        else {
                            console.info('Added %s, %s with id=%s', new_user.userurl, new_user.profile.tokens, new_user._id);
                        }
                    });
                }
                var locals = {
                    user: name,
                    imgurl: imgurl,
                    userurl: url,
                    gauthurl: gapi.url
                };
                res.cookie('userurl', url, { maxAge: 900000000 });
                res.render('index.jade', locals);
            });
        });
    });
};

/*
 Gets user data to save to the users database
 */
var getData = function(callback) {
    gapi.client.plus.people.get({
        userId: 'me',
        auth: gapi.client
    }, function (err, resp) {
        if (err) console.log(err.message);
        console.log('ID: ' + resp.id);
        console.log('Display Name: ' + resp.displayName);
        console.log('Image URL: ' + resp.image.url);
        console.log('Profile URL: ' + resp.url);
        console.log('EMAIL: ' + resp.emails[0]);
        callback(null, resp.url, resp.displayName, resp.image.url);
    });

};