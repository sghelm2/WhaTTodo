/**
 * Created by Sarah on 11/13/2014.
 */
var app = require('../app'),
    superagent = require('superagent'),
    util = require('util'),
    expect = require('expect.js');

describe('Database Test',function(done){
    var id;
    it('post user', function(done){
        superagent.post('http://localhost:3000/collections/users')
            .send({ userurl : 'userurl.com',
                profile : {
                    user: 'Example Name',
                    imgurl: 'imgurl.com',
                    tokens: 'tokens'
                }
            })
            .end(function(e,res){
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(res.body.length).to.eql(1);
                expect(res.body[0]._id.length).to.eql(24);
                expect(res.body[0].userurl).to.eql('userurl.com');
                id = res.body[0]._id;
                done()
            })
    });

    it('retrieves a user', function(done){
        superagent.get('http://localhost:3000/collections/users/'+id)
            .end(function(e, res){
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body._id.length).to.eql(24);
                expect(res.body._id).to.eql(id);
                done()
            })
    });

    it('retrieves a collection', function(done){
        superagent.get('http://localhost:3000/collections/users')
            .end(function(e, res){
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(res.body.length).to.be.above(0);
                expect(res.body.map(function (item){return item._id})).to.contain(id);
                done()
            })
    });

    it('updates a user', function(done){
        superagent.put('http://localhost:3000/collections/users/'+id)
            .send({ //get user url based on database and
                tasks : [ {
                    name: 'New Task',
                    priority: '1',
                    completed: 'false'
                }]
            })
            .end(function(e, res){
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.msg).to.eql('success');
                done()
            })
    });
    it('checks an updated user', function(done){
        superagent.get('http://localhost:3000/collections/users/'+id)
            .end(function(e, res){
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body._id.length).to.eql(24);
                expect(res.body._id).to.eql(id);
                expect(res.body.tasks.length).to.eql(1);
                expect(res.body.profile.user).to.eql('Example Name');
                console.log('user: ' + util.inspect(res.body, false, null));
                done()
            })
    });

    it('removes a user', function(done){
        superagent.del('http://localhost:3000/collections/users/'+id)
            .end(function(e, res){
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.msg).to.eql('success');
                done()
            })
    })
});