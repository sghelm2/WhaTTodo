/**
 * Created by Sarah on 11/4/2014.
 * Code based off of turoial here: http://webapplog.com/todo-app-with-express-jsnode-js-and-mongodb/
 * and here: http://javascriptplayground.com/blog/2013/06/node-and-google-oauth/
 */

var util = require('util'),
    gapi = require('../gapi'),
    helpers = require('../helpers'),
    ObjectID = require('mongodb').ObjectID,
    gcal = require('google-calendar'),
    RRule = require('rrule').RRule;



/*
 * GET tasks list.
 */

exports.list = function(req, res, next){
    console.log('cookie: ' + util.inspect(req.cookies.userurl, false, null));
    if(typeof(req.cookies.userurl) === 'undefined' || req.cookies.userurl === null) {
        res.send(401);
    }
    // Gets the current user from the database
    req.db.users.findOne({
         userurl : req.cookies.userurl }, function(error, user){ //TODO: find user and then find that user's uncompleted tasks!
             if (error) console.log(error.message);
             //tasks = the list of tasks that the user has
             var tasks = user['tasks'];
             //if there are no tasks, render the page right away
            console.log('tasks: ' +  util.inspect(tasks, false, null));
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
                 console.log('tasks: ' + util.inspect(tasks, false, null));
                 //get the current date
                 var d = new Date,
                     dformat = [(d.getMonth()+1),
                         d.getDate(),
                         d.getFullYear()].join('/');
                 console.log(dformat);
                 //if there are more than one tasks
                 if(tasks.length > 1 ) {
                     //sort the tasks comparing how many days until the task and the task's priority
                     tasks.sort(function (a, b) {
                         //1 = highest proirity
                         var priorityDifference = a.priority - b.priority;
                         var currDate = helpers.parseDate(dformat);
                         var aDateDifference = daydiff(currDate, a.date);
                         var bDateDifference = daydiff(currDate, b.date);
                         var dateDifference = aDateDifference - bDateDifference;
                         if (aDateDifference < 0) {
                             //overdue
                         }
                         if (bDateDifference < 0) {
                             //overdue
                         }
                         //TODO: FIX! if the dates are within a week of the current date and they are not the same priority, put the higher priority at the top of the list
                         else if (((aDateDifference < 7 && bDateDifference < 7) || Math.abs(dateDifference) < 5) && priorityDifference !== 0) {
                             return priorityDifference;
                         }
                         //otherwise make the order of the list dependent on the dates
                         else {
                             return aDateDifference - bDateDifference;
                         }
                     });
                 }

                 var locals = {
                     user: user['profile']['user'],
                     imgurl: user['profile']['imgurl'],
                     userurl: user['userurl'],
                     gauthurl: gapi.url,
                     title: 'Todo List',
                     tasks: tasks || []
                 };
                 res.render('tasks', locals);
             }
    });
};

function daydiff(first, second) {
    return (second-first)/(1000*60*60*24);
}

//adds preceding zeros to numbers with less than 10 for dates
Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

/*
 * Deletes a task from the database. If the task is repeated,
 * this function grabs the next task that cooresponds to this one
 * (if weekly, the next week's, if biweekly, the one in two weeks, etc.
 */
exports.del = function(req, res, next) {
    console.log('ENTERED DELETE');
    if (!req.query.id) console.log('Error deleting task from the database');
    req.db.users.findOne({
        userurl : req.cookies.userurl }, function(error, user){
        if (error) console.log(error.message);
        var tasks = user['tasks'];
        for(var i = 0; i<tasks.length; i++) {
            console.log("id: " + req.query.id);
            var task = tasks[i];
            if (task._id == req.query.id) {
                tasks.splice(i, 1);
                /*
                 if(task.repeated == 1) {
                 //console.log('freq: ' + util.inspect(task.freq, false, null));
                 var weeks = parseInt(task.freq.weeks);
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
                 tasks.splice(i, 1);                                                                  //delete the task

                 //console.log('tasks spliced!');
                 break;//breaks out of for loop??
                 }
                 } else {
                 tasks.splice(i, 1);
                 //console.log('tasks spliced!');
                 break;
                 }
                 */
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

