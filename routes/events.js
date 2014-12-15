/**
 * Created by Sarah on 11/11/2014.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
exports.getGoogleEvents = function(accessToken) {
        {
            //instantiate google calendar instance
            var google_calendar = new gcal.GoogleCalendar(accessToken);

            google_calendar.events.list(googleUserId, {'timeMin': new Date().toISOString()}, function(err, eventList){
                if(err){
                    response.send(500, err);
                }
                else{
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(eventList, null, '\t'));
                    response.end();
                }
            });
        };

        //retrieve current access token
        getAccessToken().then(function(accessToken){
            getGoogleEvents(accessToken);
        }, function(error){
            //TODO: handle getAccessToken error
        });

 };



exports.addEvent = function(){

    var addEventBody = {
        'status':'confirmed',
        'summary': request.body.contact.firstName + ' ' + request.body.contact.lastName,
        'description': request.body.contact.phone + '\n' + request.body.contact.details,
        'organizer': {
            'email': googleUserId,
            'self': true
        },
        'start': {
            'dateTime': request.body.startdate
        },
        'end': {
            'dateTime': request.body.enddate
        },
        'attendees': [
            {
                'email': googleUserId,
                'organizer': true,
                'self': true,
                'responseStatus': 'needsAction'
            },
            {
                'email': request.body.contact.email,
                'organizer': false,
                'responseStatus': 'needsAction'
            }
        ]
    };

    var addGoogleEvent = function(accessToken){
        //instantiate google calendar instance
        var google_calendar = new gcal.GoogleCalendar(accessToken);
        google_calendar.events.insert(googleUserId, addEventBody, function(addEventError, addEventResponse){
            console.log('GOOGLE RESPONSE:', addEventError, addEventResponse);

            if(!addEventError)
                response.send(200, addEventResponse);

            response.send(400, addEventError);
        });
    };

    //retrieve current access token
    getAccessToken().then(function(accessToken){
        addGoogleEvent(accessToken);
    }, function(error){
        //TODO: handle error
    });

};

/*
 console.log("calendar: " + util.inspect(google_calendar.calendarList, false, null));
 google_calendar.calendarList.list({
 auth: gapi.client,
 fields: {
 items: ["end","start","summary"]
 }
 }, function (err, CL) {
 if (err) console.log(err.message);
 console.log("calendar list: " + util.inspect(CL, false, null));
 /*for (var i = CL.items.length - 1; i >= 0; i--) {
 my_calendars.push(CL.items[i].summary);
 };
 });

 gapi.cal.calendarList.list(function(err, resp) {
 if (err) console.log(err.message);
 console.log(resp);
 for (var i = resp.items.length - 1; i >= 0; i--) {
 my_calendars.push(resp.items[i].summary);
 };
 });*/
//};

/*
 exports.cal = function(req, res){
 var locals = {
 title: "These are your calendars",
 user: my_profile.name,
 bday: my_profile.birthday,
 events: my_calendars,
 email: my_email,
 imgurl: my_profile.imgurl,
 url: my_profile.url
 };
 res.render('layout.jade', locals);
 };*/
