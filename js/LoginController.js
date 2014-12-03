(function () {
    var app = angular.module("digs");

    var MainController = function ($scope) {        
        var myFirebaseRef = new Firebase('https://boiling-torch-2013.firebaseio.com/');
        var userRef = myFirebaseRef.child('users');
        
        var authData = myFirebaseRef.getAuth();
        var currentUserRef;
        var houseRef = myFirebaseRef.child('houses');
        var messageRef = myFirebaseRef.child('messages');

        $scope.navigation = [
            {
                label: "Dashboard",
                href: "#/Dashboard",
                icon: "img/dashboard.png"
            },
            {
                label: "Calendar",
                href: "#/Calendar",
                icon: "img/cal.png"
            },
            {
                label: "Banking",
                href: "#/Banking",
                icon: "img/bank.png"
            },
            {
                label: "Shopping",
                href: "#/Shopping",
                icon: "img/shopping.png"
            },
            {
                label: "Profile",
                href: "#/Profile",
                icon: "img/profile.png"
            }
    ];
        $scope.userLoginState = function checkIfUserIsLoggedIn(){
            if(authData){
                window.location.html="/Dashboard";
            } else{
                window.location.html="/login";
            }
        }
        
        myFirebaseRef.onAuth(function (authData) {
            if (authData) {
                currentUserRef = userRef.child(authData.uid);
                window.location.html="/Dashboard";
                loggedIn();
            } else {
                window.location.html="/login";
            }
        });

        $scope.login = function logIn(){
            ref.authWithOAuthPopup("facebook", function (error, authData) {
                checkIfUserExists(authData);
            })
        };

        function checkIfUserExists(authData) {
            currentUserRef.once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                userExistsCallback(authData, exists);
            })
        }

        function userExistsCallback(authData, exists) {
            if (!exists) {
                currentUserRef.set(authData);
            }
        }

        function loggedIn() {
            viewProfilePicture(authData);
            var exist = checkIfHouseExists();
            if (exist) {
                houseDetails();
                $(".logged-in-no-house").hide();
                $(".logged-in").show();
            } else {
                $(".logged-in-no-house").show();
                $(".logged-in").hide();
            }
        }

        function viewProfilePicture(authData) {
            var currentUserData = curre.child("facebook").child("cachedUserProfile");
            currentUserData.child('picture').child('data').child("url").on("value", function (snapshot) {
                var data = snapshot.val();
                $("#currentUsersProfilePicture").attr("src", data);
            });
            getHouseHoldProfilePictures();
        }

        function getHouseHoldProfilePictures() {
            var pictureList = $("#houseHoldProfilePictures");

            currentUserRef.child("houseID").on("value", function (snapshot) {
                var houseID = snapshot.val();
                houseRef.child(houseID).child("members").child("uidOfMembers").orderByChild("uid").on("value", function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var data = childSnapshot.val();
                        if (data.uid != authData.uid) {
                            var profilePicture = $("<li><img src='" + data.profilePicture + "'></li>");
                            pictureList.append(profilePicture);
                        }

                    });
                })
            })
        }

        function checkIfHouseExists() {
            currentUserRef.on("value", function (snapshot) {
                var data = snapshot.val();
                return data;
            })
        }

        function houseDetails() {
            currentUserRef.child("houseID").on("value", function (snapshot) {
                var houseID = snapshot.val();
                if (houseID != null) {
                    houseRef.child(houseID).on("value", function (snapshot) {
                        var data = snapshot.val();
                        var housename = data.nickName;
                        $("#houseName").html(housename);
                    });
                }
            });
        }

        function addUserToHouse() {
            var houseID = $("#existingKey").val();
            var exists = checkIfHouseExists();

            if (exists) {
                userRef.child(authData.uid).update({
                    houseID: houseID
                });

                houseRef.child(houseID).child("members").child("uidOfMembers").child(authData.uid).update({
                    uid: authData.uid,
                    profilePicture: authData.facebook.cachedUserProfile.picture.data.url
                });
                windows.location.href = "/Dashboard.html";
            }
        }

        function addHouse() {
            var AddressFirstLine = $("#AddressFirstLine");
            var AddressTown = $("#AddressTown");
            var AddressCounty = $("#AddressCounty");
            var AddressPostCode = $("#AddressPostCode");
            var houseNickName = $("#houseNickName");

            var newHouse = houseRef.push({
                firstLine: AddressFirstLine.val(),
                town: AddressTown.val(),
                county: AddressCounty.val(),
                postcode: AddressPostCode.val(),
                nickName: houseNickName.val()
            });

            var uid = newHouse.key();

            newHouse.child("members").child("uidOfMembers").child(authData.uid).update({
                uid: authData.uid,
                profilePicture: authData.facebook.cachedUserProfile.picture.data.url
            });

            newHouse.update({
                uid: uid
            });

            var userRef = myFirebaseRef.child("users");
            userRef.child(authData.uid).update({
                houseID: uid
            });
            
            windows.location.href = "/Dashboard.html";
        }

        function createMessage() {
            var messageField = $('#messageInput');
            var nameField = authData.facebook.displayName;
            var picture = $('#pictureInput');

            currentUserRef.child("houseID").on("value", function (snapshot) {
                var houseID = snapshot.val();
                var uid = authData.uid;
                var name = authData.facebook.displayName;
                var message = messageField.val();

                messageRef.push({
                    uid: uid,
                    houseID: houseID,
                    name: name,
                    timeStamp: Date.now(),
                    picture: picture.val(),
                    text: message
                });
                messageField.val('');
                picture.val('');
            })
        }

        function showMessage() {

            var messageList = $('#example-messages');

            currentUserRef.child("houseID").on("value", function (snapshot) {
                var currentHouseID = snapshot.val();

                messageRef.limit(10).on('child_added', function (snapshot) {
                    //GET DATA
                    var data = snapshot.val();
                    var userID = data.uid;
                    var username = data.name;
                    var message = data.text;
                    var picture = data.picture;
                    var houseID = data.houseID;

                    if (houseID == currentHouseID) {
                        var messageElement = $("<li>");
                        var nameElement = $("<strong class='example-chat-username'></strong>");


                        nameElement.text(username);
                        messageElement.text(message).prepend(nameElement);

                        if (picture) {
                            var imageElement = $("<img class='uploadedImage' src='" + picture + "'>");
                            messageElement.append(imageElement);
                        }
                        messageList.prepend(messageElement);

                        messageList[0].scrollTop = messageList[0].scrollHeight;
                    }
                });
            })
        }
    };
    app.controller("MainController", MainController);
})();