/**
 * Created by Sarah on 11/13/2014.
 */

/*******************INDEX********************/
var gapi = require('../gapi');

exports.index =  function(req, res) {
    req.db.users.findOne({
        userurl : req.cookies.userurl }, function(error, user) { //TODO: find user and then find that user's uncompleted tasks!
            if (error) console.log(error.message);
            if(user === null || typeof user === 'undefined') {
                var locals = {
                    gauthurl: gapi.url,
                    title: 'TodoList'
            };
            } else {
                locals = {
                    user: user['profile']['user'],
                    imgurl: user['profile']['imgurl'],
                    userurl: user['userurl'],
                    gauthurl: gapi.url,
                    title: 'Todo List',
                    tasks: []
                };
            }
        res.render('index', locals);
    });
};