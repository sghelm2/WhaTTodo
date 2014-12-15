var express = require('express'),
    path = require('path'),
    http = require('http'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    csrf = require('csurf'),
    less = require('less-middleware'),
    errorHandler = require('errorhandler'),
    mongoskin = require('mongoskin'),
    gapi = require('./gapi'),
    user_auth = require('./routes/user_auth'),
    tasks = require('./routes/tasks'),
    events = require('./routes/events'),
    index = require('./routes/index'),
    add_task = require('./routes/add_task'),
    complete = require('./routes/complete'),
    db = mongoskin.db('mongodb://shlm:shlm2016@ds063180.mongolab.com:63180/whattodo', {safe:true}),
    router = express.Router(),
    app = express();

//export database object to all middlewares to be able to perform database operations in the routes modules
app.use(function(req, res, next) {
    req.db = {};
    req.db.users = db.collection('users');
    next();
});

// view engine setup
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/views'));

app.set('port', process.env.PORT || 3000);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

//prints requests to the terminal window
app.use(logger('dev'));

//allows for painless access to incoming data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//work around for HTTP methods that involve headers
app.use(methodOverride());
//cookieParser and session() necessary to use CSRF
app.use(cookieParser());
app.use(session({
    secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9',
    resave: false,
    saveUninitialized: false
}));
//app.use(csrf());
app.use(less(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'public')));

/*app.use(function(req, res, next) {
    res.locals._csrf = req.csrfToken();
    return next();
});*/

//configure different behavior based on environments
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

//when tasks/task_id is found, execute this function:
app.param('task_id', function(req, res, next, taskId) {
    //query database to find that id
    req.db.tasks.findById(taskId, function(error, task) {
        if (error) return next(error);
        if (!task)return next(new Error('Task is not found.'));
        req.task = task;
        return next();
    });
});


/***********Sets up RESTful interface*******/
app.param('collectionName', function(req, res, next, collectionName){
    req.collection = db.collection(collectionName);
    return next()
});

app.route('/collections/:collectionName')
    .get(function(req, res, next) {
        req.collection.find({} ,{sort: [['_id',1]]}).toArray(function(e, results){
            if (e) return next(e);
            res.json(results)
        })
    })
    .post(function(req, res, next) {
        req.collection.insert(req.body, {}, function(e, results){
            if (e) return next(e);
            res.send(results)
        })
    });

app.route('/collections/:collectionName/:id')
    .get(function(req, res, next) {
        req.collection.findById(req.params.id, function(e, result){
            if (e) return next(e)
            res.send(result)
        })
    })
    .put(function(req, res, next) {
        req.collection.updateById(req.params.id, {$push:req.body}, {safe:true, multi:false}, function(e, result){
            if (e) return next(e)
            res.send((result===1)?{msg:'success'}:{msg:'error'})
        })
    })
    .delete(function(req, res, next) {
        req.collection.removeById(req.params.id, function(e, result){
            if (e) return next(e)
            res.send((result===1)?{msg:'success'}:{msg:'error'})
        })
    })
/********end of RESTful setup**********/

//app.use('/cal', oauth2.cal);
app.post('/add', add_task.add); //add new tasks
//app.put('/edit', tasks.edit);
app.use('/add', add_task.addPage);
app.post('/complete', complete.markCompleted);
app.post('/delete', tasks.del);
app.get('/delete', tasks.del);
app.use('/completed', complete.completed);
app.use('/uncomplete', complete.markUncompleted);
app.use('/oauth2callback', user_auth.oauth2);
app.use('/tasks', tasks.list);
app.use('/', index.index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log("development error");
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log("production error");
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
/* csrf handler
// error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('session has expired or form tampered with')
})

// pass the csrfToken to the view
app.get('/tasks', function(req, res) {
    res.render('send', { csrfToken: req.csrfToken() })
})*/

http.createServer(app).listen(app.get('port'),
    function(){
        console.log('Express server listening on port '
            + app.get('port'));
    }
);

module.exports = app;
