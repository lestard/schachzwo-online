"use strict";

var uuid = require("node-uuid");
var model = require("../model/model");

var db = require('mongoskin').db('mongodb://localhost:27017/schachzwo');

var MongDB = function() {

    this.getMatch = function (id,callback) {
        db.collection('matches').findOne({matchId: id}, function(err,item){
                callback(err,item);
        });
    };

    this.deleteMatch = function (id,callback) {
        db.collection('matches').remove({matchId: id},function(err){
            callback(err);
        });
    };

    this.createMatch = function (match,callback) {
        if(!!match){
            match.matchId = uuid.v4();
            db.collection('matches').insert(match,function(err){
                if(callback) callback(err, match);
            });
        }else{
            if(!!callback){
                callback(new Error("Can't create match. First param has to be a valid match instance"), null);
            }
        }
    };

    this.updateMatch = function(match, callback) {
        db.collection('matches').update({matchId:match.matchId}, match, null, function(err, count){
            callback(err, match);
        });
    }

};

module.exports = MongDB;
