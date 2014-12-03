(function () {

    var app = angular.module("digs", ['ngRoute']);

    app.config(function ($routeProvider) {
        $routeProvider
            .when("/Login", {
                templateUrl: "login.html",
                controller: "LoginController"
            })
            .when("/Dashboard", {
                templateUrl: "dashboard.html",
                controller: "DashboardController"
            })
            .when("/Banking", {
                templateUrl: "money.html",
                controller: "MoneyController"
            })
            .when("/Calendar", {
                templateUrl: "calendar.html",
                controller: "CalendarController"
            })
            .when("/Profile", {
                templateUrl: "profile.html",
                controller: "ProfileController"
            })
            .otherwise({
                redirectTo: "/Login"
            });
    });
}());
}());