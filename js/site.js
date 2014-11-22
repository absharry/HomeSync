var myFirebaseRef = new Firebase("https://boiling-torch-2013.firebaseio.com/");

var authData = myFirebaseRef.getAuth();

myFirebaseRef.onAuth(function (authData) {
    if (authData) {
        myFirebaseRef.child('users').child(authData.uid).update(authData);
    } else {
        $(".logInButton").attr("onClick", "logIn()");
        $(".logInButton").html("Login!");
    }
});

function houseDetails() {
    houseRef = myFirebaseRef.child("houses");
    userRef = myFirebaseRef.child("users");
    userRef.child(authData.uid).child("houseID").on("value", function (snapshot) {
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

$(function checkLogInState() {
    if (authData) {
        $(".logged-out").hide();
        loggedIn();
    } else {
        $(".logged-out").show();
    }
})

function logIn() {
    myFirebaseRef.authWithOAuthPopup("facebook", function (err, authData) {
        if (err) {
            if (err.code === "TRANSPORT_UNAVAILABLE") {
                myFirebaseRef.authWithOAuthRedirect("facebook", function (err, authData) {
                    this.authData = authData;
                })
            }
        } else {
            loggedIn();
        }
    });
}

function loggedIn() {
    viewProfilePicture(authData);
    checkIfHouseExists();
    houseDetails();
    $(".logged-in").show();
}

function checkIfHouseExists() {
    var userRef = myFirebaseRef.child("users");
    userRef.child(authData.uid).on("value", function (snapshot) {
        var data = snapshot.val();
        if (data.houseID == null) {
            $(".logged-in-no-house").show();
            $(".logged-in").hide();
        } else {
            $(".logged-in-no-house").hide();
        }
    })
}

function addUserToHouse() {
    var houseRef = myFirebaseRef.child("houses");
    var userRef = myFirebaseRef.child("users");
    var houseID = $("#existingKey").val();

    userRef.child(authData.uid).update({
        houseID: houseID
    });

    houseRef.child(houseID).child("members").child("uidOfMembers").child(authData.uid).update({
        uid: authData.uid,
        profilePicture: authData.facebook.cachedUserProfile.picture.data.url
    });

    checkIfHouseExists();
}


function addHouse() {
    var houseRef = myFirebaseRef.child("houses");
    var AddressFirstLine = $("#AddressFirstLine");
    var AddressTown = $("#AddressTown");
    var AddressCounty = $("#AddressCounty");
    var AddressPostCode = $("#AddressPostCode");
    var houseNickName = $("#houseNickName").val();

    var newHouse = houseRef.push({
        firstLine: AddressFirstLine.val(),
        town: AddressTown.val(),
        county: AddressCounty.val(),
        postcode: AddressPostCode.val(),
        nickName: houseNickName
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

    checkIfHouseExists();

}

function setHouseNickname() {
    var houseRef = myFirebaseRef.child("houses");
    var userRef = myFirebaseRef.child("users").child(authData.uid);

}

function viewProfilePicture(authData) {
    myFirebaseRef.child('users').child(authData.uid).child('facebook').child('cachedUserProfile').child('picture').child('data').child("url").on("value", function (snapshot) {
        var data = snapshot.val();
        console.log(data);
        $("#currentUsersProfilePicture").attr("src", data);
    });

    getHouseHoldProfilePictures();
}

function getHouseHoldProfilePictures() {
    var houseRef = myFirebaseRef.child("houses");
    var userRef = myFirebaseRef.child("users");

    var pictureList = $("#houseHoldProfilePictures");

    userRef.child(authData.uid).child("houseID").on("value", function (snapshot) {
        var houseID = snapshot.val();

        houseRef.child(houseID).child("members").child("uidOfMembers").orderByChild("uid").on("value", function (snapshot) {
            var data1 = snapshot.val();
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

function messaging() {
    var messageField = $('#messageInput');
    var nameField = authData.facebook.displayName;
    var picture = $('#pictureInput');

    userRef.child(authData.uid).child("houseID").on("value", function (snapshot) {
        var houseID = snapshot.val();
        var uid = authData.uid;
        var name = authData.facebook.displayName;
        var message = messageField.val();
        var messages = myFirebaseRef.child('messages');

        messages.push({
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


$(function showMessage() {
    var messages = myFirebaseRef.child('messages');
    var userRef = myFirebaseRef.child("users");
    var messageList = $('#example-messages');

    userRef.child(authData.uid).child("houseID").on("value", function (snapshot) {
        var currentHouseID = snapshot.val();

        messages.limit(10).on('child_added', function (snapshot) {
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
})


function removeProfilePicture() {
    $(".profilePicture").html("");
}

function logOut() {
    myFirebaseRef.unauth();
    removeProfilePicture();
    alert("Logged Out!");
}