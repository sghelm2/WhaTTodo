/**
 * Created by Sarah on 12/4/2014.
 */
var app = require('../app'),
    superagent = require('superagent'),
    util = require('util'),
    gapi = require('../gapi'),
    expect = require('expect.js');

describe('User API',function(done) {
    var id;
    it('post user', function (done) {
        superagent.post('http://localhost:3000/collections/users')
            .send({ userurl: 'userurl.com',
                profile: {
                    user: 'Example Name',
                    imgurl: 'imgurl.com',
                    tokens: 'tokens'
                }
            })
            .end(function (e, res) {
                // console.log(res.body)
                expect(e).to.eql(null);
                expect(res.body.length).to.eql(1);
                expect(res.body[0]._id.length).to.eql(24);
                expect(res.body[0].userurl).to.eql('userurl.com');
                id = res.body[0]._id;
                done()
            })
    });
});
