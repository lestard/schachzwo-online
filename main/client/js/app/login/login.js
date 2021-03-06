'use strict';

define(['angular', 'jquery', 'jquery-validate', 'angular-translate'], function (angular, $) {

    angular.module("login", [])
        .controller("loginCtrl", ["$scope", "$http", "$routeParams", "endpoint", "$location", "$cookies", "$translate",
            function ($scope, $http, $routeParams, endpoint, $location, $cookies, $translate) {

                var matchId = $routeParams.matchId;

                $('#login-form').validate({
                    errorClass: 'help-block animation-slideDown',
                    errorElement: 'span',
                    errorPlacement: function (error, e) {
                        e.parents('.form-group > div').append(error);
                    },
                    highlight: function (e) {
                        $(e).closest('.form-group').removeClass('has-success has-error').addClass('has-error');
                        $(e).closest('.help-block').remove();
                    },
                    success: function (e) {
                        e.closest('.form-group').removeClass('has-success has-error');
                        e.closest('.help-block').remove();
                    },
                    rules: {
                        playerName: {
                            required: true,
                            maxlength: 20
                        }
                    },
                    messages: {
                        playerName: {
                            required: ' ',
                            maxlength: $translate.instant("VALIDATION_MAX_LENGTH", {length: 20})
                        }
                    }
                });

                $scope.match = {size: 7};
                $scope.playerName = $cookies.schachZwoPlayerName;

                $http.get(endpoint + "/" + matchId).success(function (match) {
                    $scope.match = match;

                });

                $scope.login = function () {
                    if ($('#login-form').valid()) {
                        $cookies.schachZwoPlayerName = $scope.playerName;
                        console.log("login : " + matchId);
                        $http.post(endpoint + "/" + matchId + "/login", {name: $scope.playerName})
                            .success(function (player) {
                                $location.path("/match/" + matchId);
                            })
                            .error(function (data, status, headers, config) {
                                console.log("error:" + status);
                                $location.path("/500");
                            });
                    }
                };

            }]);

});
