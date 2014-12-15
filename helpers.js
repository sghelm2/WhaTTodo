/**
 * Created by Sarah on 11/25/2014.
 */

exports.parseDate = function (day) {
    var mdy = day.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1]);
}

exports.parseDateTime = function (day, hour, min){
    var mdy = day.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1], hour, min);
}
