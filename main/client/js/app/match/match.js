'use strict';

define(['angular'], function (angular) {

    angular.module('match', []).
        controller('matchCtrl', ['$scope', '$routeParams', '$http', 'endpoint', 'sse', 'matchLink',
            function ($scope, $routeParams, $http, endpoint, sse, matchLink) {

                var matchId = $routeParams.matchId;
                var selectedField = {};
                var validMoves = [];

                $scope.matchLink = matchLink(matchId);
                $scope.match = {size: 7, state: 'preparing'};
                $scope.self = {color: 'black'};
                $scope.board = [];
                $scope.moves = [];
                $scope.itsMyTurn = false;
                $scope.onlooker = false;


                sse(matchId).addEventListener("message", function (event) {
                    console.log(event.data);

                    if (event.data == "update") {
                        update();
                    }
                    if (event.data == "match-started") {
                        initMatch();
                    }
                }, false);


                var initMatch = function () {

                    $http.get(endpoint + "/" + matchId).success(function (match) {
                        $scope.match = match;

                        $http.get(endpoint + "/" + matchId + "/self").success(function (player) {
                            $scope.self = player;
                            update();
                        }).error(function () {
                            $scope.onlooker = true;
                            update();
                        });
                    });

                };
                initMatch();


                var update = function () {
                    $http.get(endpoint + "/" + matchId + "/board").success(function (board) {
                        clearSelections();
                        $scope.board = [];

                        board.forEach(function (field) {
                            if (field.figure) {
                                $scope.board.push(field);
                            }
                        });

                        $http.get(endpoint + "/" + matchId + "/moves").success(function (moves) {
                            $scope.moves = moves;
                            $scope.itsMyTurn = !$scope.onlooker && (moves.length + ($scope.self.color == 'white' ? 1 : 0)) % 2 == 0;
                        });

                        $http.get(endpoint + "/" + matchId + "/valid-moves").success(function (moves) {
                            validMoves = moves;
                        });

                    });
                };

                var clearSelections = function () {
                    selectedField = {};
                    $scope.board = $scope.board.filter(function (field) {
                        return !field.selected && !field.accessible;

                    });
                };

                var getField = function (row, column) {
                    for (var i in $scope.board) {
                        var field = $scope.board[i];
                        if (field.position.row === row && field.position.column === column) {
                            return field;
                        }
                    }
                };

                var getValidMoves = function (field) {

                    for (var i in validMoves) {
                        var entry = validMoves[i];
                        if (entry.field.position.row == field.position.row && entry.field.position.column == field.position.column) {
                            return entry.fields;
                        }
                    }
                    return [];
                };


                $scope.onSelect = function (row, column) {
                    if (!$scope.itsMyTurn || $scope.match.state != 'playing') {
                        return;
                    }

                    var field = getField(row, column);

                    if (field && field.figure && field.figure.color == $scope.self.color) {
                        clearSelections();
                        selectedField = field;
                        $scope.board.push({position: {row: row, column: column}, selected: true});

                        getValidMoves(field).forEach(function (pos) {
                            $scope.board.push({position: {row: pos.row, column: pos.column}, accessible: true});
                        });


                    } else if (selectedField) {

                        getValidMoves(selectedField).forEach(function (pos) {

                            if (field && pos.row == field.position.row && pos.column == field.position.column) {

                                var move = {
                                    figure: selectedField.figure,
                                    from: selectedField.position,
                                    to: field.position
                                };

                                $http.post(endpoint + "/" + matchId + "/moves", move).success(function () {
                                    $scope.itsMyTurn = false;
                                    update();
                                });
                            }
                        });
                    }
                };

            }]);


});
