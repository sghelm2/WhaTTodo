/**
 * Created by Sarah on 11/25/2014.
 */
var util = require('util'),
    gapi = require('../gapi'),
    helpers = require('../helpers'),
    ObjectID = require('mongodb').ObjectID,
    RRule = require('rrule').RRule;

/*
 * GET add a task page.
 */
exports.addPage = function (req, res) {
    console.log('cookie: ' + util.inspect(req.cookies.userurl, false, null));
    if(typeof(req.cookies.userurl) === 'undefined' || req.cookies.userurl === null) {
        res.send(401);
    }
    req.db.users.findOne({
        userurl : req.cookies.userurl }, function(error, user) { //TODO: find user and then find that user's uncompleted tasks!
        if (error) console.log(error.message);
        var locals = {
            user: user['profile']['user'],
            imgurl: user['profile']['imgurl'],
            userurl: user['userurl'],
            gauthurl: gapi.url,
            title: 'Todo List',
            tasks: []
        };
        res.render('add_task', locals);
    });
};

/*
 * Add a task to the database, redirect to the task list with the new task added.
 */
exports.add = function(req, res, next){
    if (!req.body || !req.body.name) console.log('Error adding the task to the database');
    req.db.users.findOne({userurl : req.cookies.userurl},
        function(error, user){
            if (error) return next(error);
            if (!user) return next(new Error('Failed to save.'));
            var tasks = user['tasks'];
            var freq = {};
            var task = {};
            var daysPerWeek = [];
            var hourOfTask = parseInt(req.body.hour);
            if (req.body.morn_aft == '1') {
                console.log('morn_after was PM!');
                hourOfTask += 12;
            }
            console.log('morn_aft: ' + req.body.morn_aft);
            console.log('repeated: ' + req.body.repeated);
            console.log('days: ' + req.body.numdays);
            if(req.body.repeated) {
                for(var i = 0; i < req.body.numdays.length; i++) {
                    daysPerWeek.push(parseInt(req.body.numdays[i]));
                }
                freq = {
                    'days' : daysPerWeek,
                    'weeks' : parseInt(req.body.numweeks),
                    'start' : helpers.parseDateTime(req.body.startdate, hourOfTask, parseInt(req.body.min)),
                    'end' : helpers.parseDateTime(req.body.enddate, hourOfTask, parseInt(req.body.min))
                };
                console.log('freq: ' + util.inspect(freq, false, null));
                var rrule = new RRule({
                    freq: RRule.WEEKLY,
                    interval: freq.weeks,
                    byweekday: daysPerWeek,
                    dtstart: freq.start,
                    until: freq.end
                });
                console.log('rrule: ' + util.inspect(rrule, false, null));
                console.log('days per week length: ' + daysPerWeek.length);
                var datesThisWeek = rrule.all(function (date, i){return i < daysPerWeek.length});
                console.log('dates this week: ' + datesThisWeek);
                for(var i = 0; i < datesThisWeek.length; i++) {
                    task = {
                        '_id': new ObjectID,
                        'name': req.body.name,
                        'date': datesThisWeek[i], //TODO: add time!
                        'completed': 'false',
                        'priority': req.body.prty,
                        'repeated': 1,
                        'freq': freq
                    };
                    console.log('Task: ' + util.inspect(task, false, null));
                    tasks.push(task);
                }
            } else {
                task = {
                    '_id': new ObjectID,
                    'name': req.body.name,
                    'date': helpers.parseDateTime(req.body.date, hourOfTask, parseInt(req.body.min)), //TODO: add time!
                    'completed': 'false',
                    'priority': req.body.prty,
                    'repeated': 0,
                    'freq': freq
                };
                console.log('Task: ' + util.inspect(task, false, null));
                tasks.push(task);
            }
            console.info('Added to %s, tasks: %s', user.userurl, user.tasks);
            req.db.users.update({userurl: user.userurl}, user, function(error) {
                if (error) console.log(error.message);
            });
            res.redirect('/tasks');
        });
};
