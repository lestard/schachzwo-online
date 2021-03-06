"use strict"
/**
 Test for board accessor logic.
 */



var assert = require("chai").assert;

var BoardAccessor = require("./board-accessor");
var StoreProvider = require("../store/store-provider");

var model = require("./../model/model");

var Color = require("../model/color");
var BoardSize = require("../model/boardsize");
var PieceType = require("../model/piece-type");
var Figure = require("../model/figure");
var Position = model.Position;

var modelFactory = require("./../model/model-factory.js");

describe ("BoardAccessor",function(){
    describe("getRangeFor", function () {
        var accessor;
        var match;
        var board;

        it("should return an empty array when there is no figure on this position", function () {
            match = modelFactory.createMatch(BoardSize.SMALL);
            accessor = new BoardAccessor(match);

            var range = accessor.getRangeFor(2, 2); // empty field

            assert.isArray(range);
            assert.equal(range.length, 0);
        });

        describe("Rocks", function () {

            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.SMALL);
                board = match.getCurrentSnapshot();

                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };

                accessor = new BoardAccessor(match);
            });

            it("should be one field upwards for black from start", function () {
                var range = accessor.getRangeFor(0, 5);  // left black rocks

                assert.isArray(range);
                assert.equal(range.length, 1);

                assert.include(range, {column: 0, row: 4});

            });

            it("should be one field downwards for white from start", function () {
                var range = accessor.getRangeFor(0, 1); // left white rocks

                assert.isArray(range);
                assert.equal(range.length, 1);


                assert.include(range, {column: 0, row: 2});

            });

            it("should be two diagonal fields next to the origin when black rocks is below origin", function () {

                board.getField(3, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
                var range = accessor.getRangeFor(3, 4);


                assert.isArray(range);
                assert.equal(range.length, 2);

                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 4, row: 3});
            });

            it("should be two diagonal fields next to the origin when white rocks is on top of origin", function () {

                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});
                var range = accessor.getRangeFor(3, 2); //


                assert.isArray(range);
                assert.equal(range.length, 2);

                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 4, row: 3});
            });

            it("should only contain one field next to the origin when the other side is blocked by own figure", function () {
                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});
                board.getField(4, 3).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});


                var range = accessor.getRangeFor(3, 2); //


                assert.isArray(range);
                assert.equal(range.length, 1);

                assert.include(range, {column: 2, row: 3});
            });

            it("should contain two fields next to origin when one is blocked by an enemy figure that can be taken", function () {
                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});
                var range = accessor.getRangeFor(3, 2); //


                assert.isArray(range);
                assert.equal(range.length, 2);

                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 4, row: 3});
            });


            it("should be empty when rocks is on top of board", function () {

                board.getField(3, 0).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(3, 0);

                assert.isArray(range);
                assert.equal(range.length, 0);
            });


            it("should be empty when there is a figure in front of the rocks", function () {

                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});
                board.getField(4, 3).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK}); // enemy

                var range = accessor.getRangeFor(3, 2);

                assert.isArray(range);
                assert.equal(range.length, 2);
                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 4, row: 3});
            });

            it("should include a figure that can be taken", function () {
                board.getField(0, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
                board.getField(1, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(0, 1);

                assert.equal(range.length, 1);
                assert.include(range, {column: 1, row: 2});
            });

            it("should not include an own figure that could be taken otherwise", function () {
                board.getField(0, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
                board.getField(1, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE}); // white can't take another white figure.


                var range = accessor.getRangeFor(0, 1);
                assert.isArray(range);
                assert.equal(range.length, 0);
            });


            it("should include two fields in front when its the big board size and the rocks is on the start position", function () {

                // we need to redefine the match for big size.
                var match = modelFactory.createMatch(BoardSize.BIG);
                var board = match.getCurrentSnapshot();
                var accessor = new BoardAccessor(match);


                var range = accessor.getRangeFor(0, 1);

                assert.equal(range.length, 2);

                assert.include(range, {column: 0, row: 2});
                assert.include(range, {column: 0, row: 3});
            });

            it("should be empty even on big boards when directly in front of the rocks is an enemy or own piece", function(){
                var match = modelFactory.createMatch(BoardSize.BIG);
                var board = match.getCurrentSnapshot();
                var accessor = new BoardAccessor(match);

                board.getField(0, 3).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(0,1);

                assert.equal(range.length, 1);
                assert.include(range, {column: 0, row: 2});

                board.getField(0, 2).figure = board.getField(0, 3).figure;
                board.getField(0, 3).figure = undefined;

                range = accessor.getRangeFor(0, 1);

                assert.equal(range.length, 0);
            });

            it("should not include include the Origin if the Rocks stands on side before the origin", function () {

                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(2, 4);

                assert.equal(range.length, 1);

                assert.include(range, {column: 2, row: 3});
            });

        });

        describe("Man", function (){

            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.SMALL);
                board = modelFactory.createEmptySnapshot(BoardSize.SMALL);
                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };

                accessor = new BoardAccessor(match);
            });

            it("should be empty at the begin as there are figures around the man", function(){
                // we create a match with the start lineup for this test.
                match = modelFactory.createMatch(BoardSize.SMALL);
                accessor = new BoardAccessor(match);

                var range = accessor.getRangeFor(0,6); // right black man.

                assert.isArray(range);
                assert.equal(range.length, 0);
            });

            it("should include the row and column", function(){
                var figure = new Figure({type:PieceType.MAN, color: Color.BLACK});
                //fake a Move to simulate Movement of the Men to prevent special Movement of the Men form his start position
                match.historyPush(new model.Move({figure: figure, from: new Position({column: 1, row: 4}), to: new Position({column: 1, row: 4})}));
                board.getField(1, 4).figure = figure;

                var range = accessor.getRangeFor(1,4);

                assert.isArray(range);
                assert.equal(range.length, 16);

                // include the column without the current field (1,4)
                assert.include(range, {column: 1, row: 0});
                assert.include(range, {column: 1, row: 1});
                assert.include(range, {column: 1, row: 2});
                assert.include(range, {column: 1, row: 3});
                assert.include(range, {column: 1, row: 5});
                assert.include(range, {column: 1, row: 6});

                // include the row without the current field.
                assert.include(range, {column: 0, row: 4});
                assert.include(range, {column: 2, row: 4});
                assert.include(range, {column: 3, row: 4});
                assert.include(range, {column: 4, row: 4});
                assert.include(range, {column: 5, row: 4});
                assert.include(range, {column: 6, row: 4});
            });


            it("should not include fields behind an own or enemy figure in the way", function(){
                var figure = new Figure({type:PieceType.MAN, color: Color.BLACK});

                //fake a Move to simulate Movement of the Men to prevent special Movement of the Men form his start position
                match.historyPush(new model.Move({figure: figure, from: new Position({column: 1, row: 4}), to: new Position({column: 1, row: 4})}));

                board.getField(1, 4).figure = figure;
                board.getField(3, 4).figure = new Figure({type:PieceType.ROCKS, color: Color.BLACK}); // my own figure on the same row
                board.getField(1, 2).figure = new Figure({type:PieceType.ROCKS, color: Color.WHITE}); // enemy figure on the same column


                var range = accessor.getRangeFor(1,4);

                assert.equal(range.length, 10);

                assert.notInclude(range, {column:4, row: 4});
                assert.notInclude(range, {column:5, row: 4});
                assert.notInclude(range, {column:6, row: 4});

                assert.notInclude(range, {column: 1, row: 1});
                assert.notInclude(range, {column: 1, row: 0});
            });

            it("should include diagonal fields in distance of one", function(){
                board.getField(1, 4).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});

                var range = accessor.getRangeFor(1,4);

                assert.include(range, {column: 0, row: 3});
                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 0, row: 5});
                assert.include(range, {column: 2, row: 5});
            });

            it("should not include fields with your own figures", function(){
                board.getField(1, 4).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type:PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(1,4);

                assert.notInclude(range, {column: 2, row: 4});
            });

            it("should include figures of the enemy", function(){
                board.getField(1, 4).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type:PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(1,4);

                assert.include(range, {column: 2, row: 4});
            });

            it("should not include the origin", function(){
                board.getField(1, 3).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});
                var range = accessor.getRangeFor(1,3);

                assert.notInclude(range, {column: 3, row: 3});
            });

            it("should include two fields diagonal from the start position when it wasn't moved yet", function(){

                board.getField(0,6).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});

                var range = accessor.getRangeFor(0, 6);

                assert.equal(range.length, 16);

                assert.include(range, {column: 1, row: 5});
                assert.include(range, {column: 2, row: 4});

            });

            it("should only include those two-distance-diagonal fields that aren't blocked by enemy figures", function(){
               // the rules say that from the start the man can go 2 fields in every direction but only
               // when there is no figure in the way.


                // we create a big board for this test.
                match = modelFactory.createEmptyMatch(BoardSize.BIG);
                board = modelFactory.createEmptySnapshot(BoardSize.BIG);
                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };
                accessor = new BoardAccessor(match);


                board.getField(0,8).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});
                board.getField(1,7).figure = new Figure({type:PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(0, 8);

                assert.equal(range.length, 18);


                assert.include(range, {column: 1, row: 6});
                assert.notInclude(range, {column: 2, row: 6}); // this field isn't reachable
                assert.include(range, {column: 2, row: 7});
            });


            it("should include fields behind the origin", function(){
                board.getField(1, 3).figure = new Figure({type:PieceType.MAN, color: Color.BLACK});
                var range = accessor.getRangeFor(1,3);

                assert.include(range, {column: 4, row: 3});
            })

        });

        describe("Woman", function() {
            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.SMALL);
                board = modelFactory.createEmptySnapshot(BoardSize.SMALL);
                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };
                accessor = new BoardAccessor(match);
            });

            it("should be empty at the begin as there are figures around the woman", function(){
                match = modelFactory.createMatch(BoardSize.SMALL);
                accessor = new BoardAccessor(match);

                board = match.getCurrentSnapshot();
                var range = accessor.getRangeFor(2,6);

                assert.isArray(range);
                assert.equal(range.length, 0);
            });

            it("should include the diagonals", function(){
                board.getField(1,4).figure = new Figure({type:PieceType.WOMAN, color: Color.BLACK});

                var range = accessor.getRangeFor(1,4);

                assert.equal(range.length, 12);

                assert.include(range, {column: 0, row: 3});
                assert.include(range, {column: 2, row: 5});
                assert.include(range, {column: 3, row: 6});

                assert.include(range, {column: 0, row: 5});
                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 3, row: 2});
                assert.include(range, {column: 4, row: 1});
                assert.include(range, {column: 5, row: 0});
            });


            it("should not include fields behind an own or enemy figure in the way", function(){

                board.getField(1, 4).figure = new Figure({type: PieceType.WOMAN, color: Color.BLACK});

                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
                board.getField(2, 5).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});


                var range = accessor.getRangeFor(1, 4);

                assert.notInclude(range, {column: 3, row: 6});

                assert.notInclude(range, {column: 4, row: 1});
                assert.notInclude(range, {column: 5, row: 0});
            });

            it("should include vertical and horizontal fields in distance of one", function(){
                board.getField(1, 4).figure = new Figure({type: PieceType.WOMAN, color: Color.BLACK});

                var range = accessor.getRangeFor(1, 4);


                assert.include(range, {column: 0, row: 4});
                assert.include(range, {column: 2, row: 4});
                assert.include(range, {column: 1, row: 3});
                assert.include(range, {column: 1, row: 5});

            });

            it("should not include fields with your own figures", function(){
                board.getField(1, 4).figure = new Figure({type: PieceType.WOMAN, color: Color.BLACK});
                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(1, 4);

                assert.notInclude(range, {column: 3, row:2});
            });

            it("should include figures of the enemy", function(){
                board.getField(1, 4).figure = new Figure({type: PieceType.WOMAN, color: Color.BLACK});
                board.getField(3, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(1, 4);

                assert.include(range, {column: 3, row:2});
            });

            it("should not include the origin", function(){
                board.getField(1, 5).figure = new Figure({type: PieceType.WOMAN, color: Color.BLACK});
                var range = accessor.getRangeFor(1, 5);

                assert.notInclude(range, {column: 3, row: 3});
            });

            it("should include fields behind the origin", function(){
                board.getField(1, 5).figure = new Figure({type: PieceType.WOMAN, color: Color.BLACK});
                var range = accessor.getRangeFor(1, 5);

                assert.include(range, {column: 4, row: 2});
                assert.include(range, {column: 5, row: 1});
                assert.include(range, {column: 6, row: 0});
            })
        });

        describe("Knight", function() {
            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.SMALL);
                board = modelFactory.createEmptySnapshot(BoardSize.SMALL);

                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };

                accessor = new BoardAccessor(match);
            });

            it("should include the typical knight positions", function(){

                board.getField(2, 4).figure = new Figure({type: PieceType.KNIGHT, color: Color.BLACK});

                var range = accessor.getRangeFor(2, 4);

                assert.include(range, {column: 1, row: 2});
                assert.include(range, {column: 3, row: 2});
                assert.include(range, {column: 0, row: 3});
                assert.include(range, {column: 4, row: 3});
                assert.include(range, {column: 0, row: 5});
                assert.include(range, {column: 1, row: 6});
                assert.include(range, {column: 3, row: 6});
                assert.include(range, {column: 4, row: 5});

            });

            it("should not include fields with your own figures", function(){
                board.getField(2, 4).figure = new Figure({type: PieceType.KNIGHT, color: Color.BLACK});

                board.getField(1, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});



                var range = accessor.getRangeFor(2, 4);

                assert.notInclude(range, {column: 1, row:2});
            });

            it("should include figures of the enemy", function(){
                board.getField(2, 4).figure = new Figure({type: PieceType.KNIGHT, color: Color.BLACK});
                board.getField(1, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(2, 4);

                assert.include(range, {column: 1, row:2});
            });

            it("should not include the origin", function(){
                board.getField(2, 5).figure = new Figure({type: PieceType.KNIGHT, color: Color.BLACK});

                var range = accessor.getRangeFor(2, 4);

                assert.notInclude(range, {column: 3, row: 3});
            });

            it("should not include fields out of the board", function(){
                board.getField(0, 0).figure = new Figure({type: PieceType.KNIGHT, color: Color.BLACK});

                var range = accessor.getRangeFor(0, 0);

                assert.equal(range.length,2);
                assert.include(range,{column: 2, row: 1});
                assert.include(range,{column: 1, row: 2});
            })

        });

        describe("Zenith", function() {
            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.SMALL);
                board = modelFactory.createEmptySnapshot(BoardSize.SMALL);

                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };
                accessor = new BoardAccessor(match);
            });

            it("should include one field in every direction", function(){
                board.getField(1, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});

                var range = accessor.getRangeFor(1, 4);

                assert.include(range, {column: 0, row: 3});
                assert.include(range, {column: 1, row: 3});
                assert.include(range, {column: 2, row: 3});

                assert.include(range, {column: 0, row: 4});
                assert.include(range, {column: 2, row: 4});

                assert.include(range, {column: 0, row: 5});
                assert.include(range, {column: 1, row: 5});
                assert.include(range, {column: 2, row: 5});
            });

            it("should include the origin", function(){
                board.getField(2, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});

                var range = accessor.getRangeFor(2, 4);

                assert.include(range, {column: 3, row: 3});
            });

            it("should include the origin even if the other zenith is already there", function(){
                board.getField(2, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});
                board.getField(3, 3).figure = new Figure({type: PieceType.ZENITH, color: Color.WHITE});

                var range = accessor.getRangeFor(2, 4);

                assert.include(range, {column: 3, row: 3});
            });

            it("should not include fields where the zenith would be in check", function(){
                board.getField(3, 5).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});
                board.getField(0, 4).figure = new Figure({type: PieceType.MAN, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 4);

                assert.notInclude(range, {column: 2, row: 4});
                assert.notInclude(range, {column: 3, row: 4});
                assert.notInclude(range, {column: 4, row: 4});
            });

            it("should not include the origin when the zenith is in check", function() {
                board.getField(3, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});
                board.getField(0, 4).figure = new Figure({type: PieceType.MAN, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 4);

                assert.notInclude(range, {column: 3, row: 3});
            });

            it("should include the origin even if the origin would be threatened by the enemy", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});
                board.getField(0, 3).figure = new Figure({type: PieceType.MAN, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 4);

                assert.include(range, {column: 3, row: 3});
            });

            it("should include field with enemy figures", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 4);

                assert.include(range, {column: 2, row: 4});
            });

            it("should not include fields with own figures", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(3, 4);

                assert.notInclude(range, {column: 2, row: 4});
            });

        });

        describe("Knowledge", function() {
            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.BIG);
                board = modelFactory.createEmptySnapshot(BoardSize.BIG);
                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };
                accessor = new BoardAccessor(match);
            });

            it("should include the diagonals", function(){
                board.getField(1,4).figure = new Figure({type:PieceType.KNOWLEDGE, color: Color.BLACK});

                var range = accessor.getRangeFor(1,4);

                assert.include(range, {column: 0, row: 3});
                assert.include(range, {column: 2, row: 5});
                assert.include(range, {column: 3, row: 6});
                assert.include(range, {column: 4, row: 7});
                assert.include(range, {column: 5, row: 8});

                assert.include(range, {column: 0, row: 5});
                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 3, row: 2});
                assert.include(range, {column: 4, row: 1});
                assert.include(range, {column: 5, row: 0});
            });

            it("should include the row and column", function(){

                board.getField(1, 5).figure = new Figure({type:PieceType.KNOWLEDGE, color: Color.BLACK});

                var range = accessor.getRangeFor(1, 5);

                assert.isArray(range);

                // include the column without the current field (1,4)
                assert.include(range, {column: 1, row: 0});
                assert.include(range, {column: 1, row: 1});
                assert.include(range, {column: 1, row: 2});
                assert.include(range, {column: 1, row: 3});
                assert.include(range, {column: 1, row: 4});
                assert.include(range, {column: 1, row: 6});
                assert.include(range, {column: 1, row: 7});
                assert.include(range, {column: 1, row: 8});

                // include the row without the current field.
                assert.include(range, {column: 0, row: 5});
                assert.include(range, {column: 2, row: 5});
                assert.include(range, {column: 3, row: 5});
                assert.include(range, {column: 4, row: 5});
                assert.include(range, {column: 5, row: 5});
                assert.include(range, {column: 6, row: 5});
                assert.include(range, {column: 7, row: 5});
                assert.include(range, {column: 8, row: 5});
            });

            it("should include fields with enemy figures", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.KNOWLEDGE, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 4);

                assert.include(range, {column: 2, row: 4});
            });

            it("should not include fields with own figures", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.KNOWLEDGE, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(3, 4);

                assert.notInclude(range, {column: 2, row: 4});
            });

            it("should not include fields behind enemy or own figures", function(){
                board.getField(1, 5).figure = new Figure({type: PieceType.KNOWLEDGE, color: Color.BLACK});
                board.getField(1, 2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
                board.getField(4, 5).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(1, 5);

                assert.notInclude(range, {column: 1, row: 1});
                assert.notInclude(range, {column: 1, row: 0});

                assert.notInclude(range, {column: 5, row: 5});
                assert.notInclude(range, {column: 6, row: 5});
            });

            it("should not include the origin", function(){
                board.getField(3, 5).figure = new Figure({type: PieceType.KNOWLEDGE, color: Color.BLACK});

                var range = accessor.getRangeFor(3, 5);

                assert.notInclude(range, {column: 4, row: 4});
            });

            it("should include fields behind the origin", function(){
                board.getField(2, 4).figure = new Figure({type: PieceType.KNOWLEDGE, color: Color.BLACK});

                var range = accessor.getRangeFor(2, 4);

                assert.include(range, {column: 5, row: 4});
                assert.include(range, {column: 6, row: 4});
                assert.include(range, {column: 7, row: 4});
                assert.include(range, {column: 8, row: 4});
            });

        });

        describe("Faith", function() {
            beforeEach(function () {
                match = modelFactory.createEmptyMatch(BoardSize.BIG);
                board = modelFactory.createEmptySnapshot(BoardSize.BIG);
                // mocking the getCurrentSnapshot
                match.getCurrentSnapshot = function(){
                    return board;
                };
                accessor = new BoardAccessor(match);
            });


            it("should include a 5x5 matrix on an empty board", function(){
                board.getField(2, 2).figure = new Figure({type: PieceType.FAITH, color: Color.BLACK});

                var range = accessor.getRangeFor(2, 2);

                assert.equal(range.length, 23);

                assert.include(range, {column: 0, row: 0});
                assert.include(range, {column: 1, row: 0});
                assert.include(range, {column: 2, row: 0});
                assert.include(range, {column: 3, row: 0});
                assert.include(range, {column: 4, row: 0});

                assert.include(range, {column: 0, row: 1});
                assert.include(range, {column: 1, row: 1});
                assert.include(range, {column: 2, row: 1});
                assert.include(range, {column: 3, row: 1});
                assert.include(range, {column: 4, row: 1});

                assert.include(range, {column: 0, row: 2});
                assert.include(range, {column: 1, row: 2});
                assert.include(range, {column: 3, row: 2});
                assert.include(range, {column: 4, row: 2});

                assert.include(range, {column: 0, row: 3});
                assert.include(range, {column: 1, row: 3});
                assert.include(range, {column: 2, row: 3});
                assert.include(range, {column: 3, row: 3});
                assert.include(range, {column: 4, row: 3});

                assert.include(range, {column: 0, row: 4});
                assert.include(range, {column: 1, row: 4});
                assert.include(range, {column: 2, row: 4});
                assert.include(range, {column: 3, row: 4});
                // 4x4 is the origin

            });

            it("should only include those fields that can be reached by two moves", function(){
                board.getField(3, 5).figure = new Figure({type: PieceType.FAITH, color: Color.BLACK});
                board.getField(2, 5).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
                board.getField(2, 6).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 5);

                assert.notInclude(range, {column: 1, row: 6});
                assert.notInclude(range, {column: 1, row: 7});
            });

            it("should not include the origin", function(){
                board.getField(3, 5).figure = new Figure({type: PieceType.FAITH, color: Color.BLACK});

                var range = accessor.getRangeFor(3, 5);

                assert.notInclude(range, {column: 4, row: 4});
            });

            it("should include fields with enemy figures", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.FAITH, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

                var range = accessor.getRangeFor(3, 4);

                assert.include(range, {column: 2, row: 4});
            });

            it("should not include fields with own figures", function(){
                board.getField(3, 4).figure = new Figure({type: PieceType.FAITH, color: Color.BLACK});
                board.getField(2, 4).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

                var range = accessor.getRangeFor(3, 4);

                assert.notInclude(range, {column: 2, row: 4});
            });

        });
    });

    describe("Instantiation of BoardAccessor", function () {

        it("should use a Match as param", function () {

            var board = modelFactory.createStartSnapshot(BoardSize.SMALL);

            var accessor = new BoardAccessor(board);

            assert.ok(accessor);
        });

        it("should fail when no match param is available", function () {

            assert.throws(function () {
                new BoardAccessor();
            });
        });

    });


    describe("isThreatenFrom",function(){
        var accessor;
        var match;
        var board;

        beforeEach(function () {
            match = modelFactory.createMatch(BoardSize.SMALL);
            board = modelFactory.createStartSnapshot(BoardSize.SMALL);
            match.getCurrentSnapshot = function(){
                return board;
            }
            accessor = new BoardAccessor(match);
        });


        it("should return empty List on empty Field",function(){
            match = modelFactory.createEmptyMatch(BoardSize.SMALL);
            board = modelFactory.createEmptySnapshot(BoardSize.SMALL);
            // mocking the getCurrentSnapshot
            match.getCurrentSnapshot = function(){
                return board;
            };

            assert.equal(accessor.getThreatenPositions(3,3).length,0);
            assert.equal(accessor.getThreatenPositions(1,2).length,0);
        });



        it("should return two Rocks and a Knight",function(){
            board.getField(2,2).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});

            var list = accessor.getThreatenPositions(2,2);

            assert.equal(list.length,3);
            assert.include(list,{column: 1, row: 1});
            assert.include(list,{column: 1, row: 0});
            assert.include(list,{column: 3, row: 1});
        });

        it("should return empty list on figure with same color",function(){
            board.getField(2,2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});
            assert.equal(accessor.getThreatenPositions(2,2).length,0);
        });

        it("should include an enemy zenith", function(){

            board.getField(2,2).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE}); // myself
            board.getField(1, 3).figure = new Figure({type: PieceType.ZENITH, color: Color.BLACK});

            var list = accessor.getThreatenPositions(2,2);

            assert.equal(list.length, 1);
            assert.include(list, {column: 1, row: 3});

        });

        it("should return one rocks and one Faith",function(){

            board = modelFactory.createEmptySnapshot(BoardSize.BIG);
            board.getField(4,5).figure = new Figure({type: PieceType.ZENITH, color: Color.WHITE});
            board.getField(3,3).figure = new Figure({type: PieceType.MAN, color: Color.BLACK});
            board.getField(5,3).figure = new Figure({type: PieceType.FAITH, color: Color.BLACK});
            board.getField(3,6).figure = new Figure({type: PieceType.ROCKS, color: Color.BLACK});
            board.getField(5,6).figure = new Figure({type: PieceType.ROCKS, color: Color.WHITE});

            var list = accessor.getThreatenPositions(4,5);

            assert.equal(list.length,2);
            assert.include(list,{column: 5, row: 3});
            assert.include(list,{column: 3, row: 6});
        });
    });

    describe("getValidMoves",function(){
        var accessor;
        var match;
        beforeEach(function () {
            match = modelFactory.createMatch(BoardSize.SMALL);
            accessor = new BoardAccessor(match);
        });

        it("should not be possible to move white rocks, because it would put the white zenith in state: check", function(){
            assert.isTrue(match.addMove2(6,5,6,4));
            assert.isTrue(match.addMove2(3,1,3,2));
            assert.isTrue(match.addMove2(6,4,6,3));
            assert.isTrue(match.addMove2(0,1,0,2));
            assert.isTrue(match.addMove2(6,6,6,4));
            assert.isTrue(match.addMove2(0,2,0,3));
            assert.isTrue(match.addMove2(6,4,3,4));

            var list = accessor.getValidMoves(Color.WHITE);
            assert.isArray(list);
            assert.equal(list.length,13);
            assert.equal(list[7].field.figure.type, PieceType.ROCKS);
            assert.equal(list[7].fields.length,0);
        });

        it("should be possible to move the zenith to origin", function(){
            assert.isTrue(match.addMove2(2,5,2,4));
            assert.isTrue(match.addMove2(3,1,3,2));
            assert.isTrue(match.addMove2(0,5,0,4));
            assert.isTrue(match.addMove2(3,0,3,1));
            assert.isTrue(match.addMove2(0,4,0,3));
            assert.isTrue(match.addMove2(3,1,2,2));
            assert.isTrue(match.addMove2(0,3,0,2));

            var list = accessor.getValidMoves(Color.WHITE);
            assert.isArray(list);
            assert.equal(list.length,10);
            assert.equal(list[3].field.figure.type, PieceType.ZENITH);
            assert.equal(list[3].fields.length, 4);


        });
    });

    describe("getCapturedPieces",function(){
        var accessor;
        var match;
        var board;

        beforeEach(function () {
            match = modelFactory.createMatch(BoardSize.SMALL);
            accessor = new BoardAccessor(match);
        });
        it("should return empty List if history is empty",function(){
            var pieces = accessor.getCapturedPieces();
            assert.equal(pieces.length,0);
        });

        it("should return one piece on a history with one captures Piece",function(){
            assert.isTrue(match.addMove2(1,6,0,4));
            assert.isTrue(match.addMove2(1,1,1,2));
            assert.isTrue(match.addMove2(0,4,1,2));
            var pieces = accessor.getCapturedPieces();

            assert.equal(pieces.length,1);
            assert.equal(pieces[0].number,1);
            assert.equal(pieces[0].piece.type,PieceType.ROCKS);
        });

        it("should return 2 pieces on a history with 2 captures Piece",function(){
            assert.isTrue(match.addMove2(1,6,0,4));
            assert.isTrue(match.addMove2(1,1,1,2));
            assert.isTrue(match.addMove2(0,4,1,2));
            assert.isTrue(match.addMove2(6,1,6,2));
            assert.isTrue(match.addMove2(1,2,3,1));
            var pieces = accessor.getCapturedPieces();

            assert.equal(pieces.length,1);
            assert.equal(pieces[0].number,2);
            assert.equal(pieces[0].piece.type,PieceType.ROCKS);
        });

        it("should return 3 pieces on a history with three captures Piece",function(){
            assert.isTrue(match.addMove2(1,6,0,4));
            assert.isTrue(match.addMove2(1,1,1,2));
            assert.isTrue(match.addMove2(0,4,1,2));
            assert.isTrue(match.addMove2(6,1,6,2));
            assert.isTrue(match.addMove2(1,2,3,1));
            assert.isTrue(match.addMove2(6,2,6,3));
            assert.isTrue(match.addMove2(3,1,1,0));
            var pieces = accessor.getCapturedPieces();

            assert.equal(pieces.length,2);
            assert.equal(pieces[0].number,2);
            assert.equal(pieces[0].piece.type,PieceType.ROCKS);
            assert.equal(pieces[1].number,1);
            assert.equal(pieces[1].piece.type,PieceType.KNIGHT);
        });

        it("should return 4 pieces on a history with 4 captures Piece after storage",function(done){
            assert.isTrue(match.addMove2(1,6,0,4));
            assert.isTrue(match.addMove2(1,1,1,2));
            assert.isTrue(match.addMove2(0,4,1,2));
            assert.isTrue(match.addMove2(6,1,6,2));
            assert.isTrue(match.addMove2(1,2,3,1));
            assert.isTrue(match.addMove2(6,2,6,3));
            assert.isTrue(match.addMove2(3,1,1,0));
            assert.isTrue(match.addMove2(0,0,1,0));

            var store = new StoreProvider.getStore();
            store.createMatch(match,function(err,result){
                store.getMatch(result.matchId, function (err, newLoadedMatch){
                    assert.ok(newLoadedMatch);
                    accessor = new BoardAccessor(newLoadedMatch);
                    var pieces = accessor.getCapturedPieces();
                    assert.equal(pieces.length,3);
                    assert.equal(pieces[0].number,2);
                    assert.equal(pieces[0].piece.type,PieceType.ROCKS);
                    assert.equal(pieces[1].number,1);
                    assert.equal(pieces[1].piece.type,PieceType.KNIGHT);
                    assert.equal(pieces[2].number,1);
                    assert.equal(pieces[2].piece.type,PieceType.KNIGHT);
                    done();
                })
            });
        });
    });
});