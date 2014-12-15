/**
 * Created by Sarah on 11/25/2014.
 */
var util = require('util'),
    gapi = require('../gapi'),
    helpers = require('../helpers'),
    ObjectID = require('mongodb').ObjectID,
    RRule = require('rrule').RRule;


/*
 * Updates all the uncompleted tasks to complete.
 */
exports.markAllCompleted = function(req, res, next) {
    if (!req.body.all_done || req.body.all_done !== 'true') console.log('Error updating the tasks to complete');
    req.db.users.update({
        completed: 'false'
    }, {$set: {
        completeTime: new Date(),
        completed: 'true'
    }}, {multi: true}, function(error, count){
        if (error) return next(error);
        console.info('Marked %s task(s) completed.', count);
        res.redirect('/tasks');
    })
};

/*
 * GETS the completed tasks and displays them
 */
exports.completed = function(req, res, next) {
    console.log('cookie: ' + util.inspect(req.cookies.userurl, false, null));
    if(typeof(req.cookies.userurl) === 'undefined' || req.cookies.userurl === null) {
        res.send(401);
    }
    req.db.users.findOne({
        userurl : req.cookies.userurl }, function(error, user){ //TODO: find user and then find that user's uncompleted tasks!
        if (error) console.log(error.message);
        var tasks = user['tasks'];
        if (tasks === null || typeof tasks === 'undefined' || tasks.length < 1) {
            var locals = {
                user: user['profile']['user'],
                imgurl: user['profile']['imgurl'],
                userurl: user['userurl'],
                gauthurl: gapi.url,
                title: 'Todo List',
                tasks: []
            };
            res.render('tasks', locals);
        } else {
            var completedTasks = []
            tasks.sort(function (a, b) {
                return b.priority - a.priority;
            });
            for(var i = 0; i< tasks.length; i++) {
                if (tasks[i].completed === 'true') {
                    completedTasks.push(tasks[i]);
                }
            }
            var locals = {
                user: user['profile']['user'],
                imgurl: user['profile']['imgurl'],
                userurl: user['userurl'],
                gauthurl: gapi.url,
                title: 'Todo List',
                tasks: completedTasks || []
            };
            res.render('tasks_completed', locals);
        }
    });
};


/*
 * Marks a task as completed and updates the task list
 */
exports.markCompleted = function(req, res, next) {
    //console.log('ENTERED MARK COMPLETE');
    if (!req.body.id) console.log('Error deleting task from the database');
    req.db.users.findOne({
        userurl : req.cookies.userurl }, function(error, user){
        if (error) console.log(error.message);
        var tasks = user['tasks'];
        for(var i = 0; i<tasks.length; i++) {
            //console.log("id: " + req.body.id);
            var task = tasks[i];
            if (task._id == req.body.id) {
                //console.log('repeated: ' + task.repeated);
                if(task.repeated == 1) {
                    //console.log('freq: ' + util.inspect(task.freq, false, null));
                    var weeks = task.freq.weeks;
                    var rrule = new RRule({
                        freq: RRule.WEEKLY,
                        interval: weeks,
                        byweekday: task.freq.days, //make sure sees all of list!! (not just take into account the first day!
                        dtstart: task.date,
                        until: task.freq.end
                    });
                    //console.log('all future dates: ' + rrule.all());
                    var nextDate = rrule.between(new Date(task.date.getTime() + weeks*(7 * 24 * 60 * 60 * 1000)),
                        new Date(task.date.getTime() + weeks*(7 * 24 * 60 * 60 * 1000)), inc=true); //take number of weeks into account!!
                    //if there's an event the next week, just reset this event's date
                    //console.log('next date: ' + nextDate);
                    if(nextDate.length > 0) {
                        //console.log('created new date: ' + nextDate[0]);
                        task.date = nextDate[0];
                    } else {
                        //console.log('no more dates');
                        task.completed = 'true';
                        //console.log('task marked completed');
                        break;//breaks out of for loop??
                    }
                } else {
                    task.completed = 'true';
                    //console.log('tasks completed!');
                    break;
                }
            }
        }
        tasks.sort(function(a,b) {
            return b.priority - a.priority;
        });
        console.log(user);
        req.db.users.update({userurl: user.userurl}, user, function(error) {
            if (error) console.log(error.message);
        });
        var locals = {
            user: user['profile']['user'],
            imgurl: user['profile']['imgurl'],
            userurl: user['userurl'],
            gauthurl: gapi.url,
            title: 'Todo List',
            tasks: tasks || []
        };
        res.redirect('/tasks');
    });
};


/*
 * Marks a task as completed and updates the task list
 */
exports.markUncompleted = function(req, res, next) {
    //console.log('ENTERED MARK COMPLETE');
    var error = null;
    if (!req.body.id) console.log('Error deleting task from the database');
    req.db.users.findOne({
        userurl : req.cookies.userurl }, function(error, user){
        if (error) console.log(error.message);
        var tasks = user['tasks'];
        for(var i = 0; i<tasks.length; i++) {
            //console.log("id: " + req.body.id);
            var task = tasks[i];
            if (task._id == req.body.id) {
                //if the task is passed due, log to the user that it is not undoable! TODO: add an option to edit the date when undoing!!
                var currentDate = new Date();
                if(currentDate > task.date) {
                    error = 'Cannot undo this task because the task is past due';
                    console.log('ERROR: Cannot undo this task because the task is past due');
                    return;
                } else {
                    task.completed = 'false';
                }
            }
        }
        tasks.sort(function(a,b) {
            return b.priority - a.priority;
        });
        console.log(user);
        req.db.users.update({userurl: user.userurl}, user, function(error) {
            if (error) console.log(error.message);
        });
        var locals = {
            error: error,
            user: user['profile']['user'],
            imgurl: user['profile']['imgurl'],
            userurl: user['userurl'],
            gauthurl: gapi.url,
            title: 'Todo List',
            tasks: tasks || []
        };
        res.redirect('/completed');
    });
};
