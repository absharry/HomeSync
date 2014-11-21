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
                $("#houseName").html("The houseshare management portal for " + housename);
            });

        }
    });
}

function logIn() {
    myFirebaseRef.authWithOAuthPopup("facebook", function (err, authData) {
        if (err) {
            if (err.code === "TRANSPORT_UNAVAILABLE") {
                myFirebaseRef.authWithOAuthRedirect("facebook", function (err, authData) {
                    this.authData = authData;
                })
            }
        } else {
            viewProfilePicture(authData);
            houseDetails();
            $(".logged-in").slideDown("slow");
            $(".logged-out").slideUp("slow");
        }
    });
}


function addHouse() {
    var houseRef = myFirebaseRef.child("houses");
    var AddressFirstLine = $("#AddressFirstLine");
    var AddressTown = $("#AddressTown");
    var AddressCounty = $("#AddressCounty");
    var AddressPostCode = $("#AddressPostCode");

    var newHouse = houseRef.push({
        firstLine: AddressFirstLine.val(),
        town: AddressTown.val(),
        county: AddressCounty.val(),
        postcode: AddressPostCode.val()
    });

    var uid = newHouse.key();

    newHouse.update({
        uid: uid
    });

    var userRef = myFirebaseRef.child("users");
    userRef.child(authData.uid).update({
        houseID: uid
    });
}

function setHouseNickname() {
    var houseRef = myFirebaseRef.child("houses");
    var userRef = myFirebaseRef.child("users").child(authData.uid);
    var houseNickName = $("#houseNickName").val();
    userRef.on("value", function (snapshot) {
        var data = snapshot.val();
        houseRef.child(data.houseID).update({
            nickName: houseNickName
        });
    });
}

function viewProfilePicture(authData) {
    myFirebaseRef.child('users').child(authData.uid).child('facebook').child('cachedUserProfile').child('picture').child('data').child("url").on("value", function (snapshot) {
        $(".profilePicture").html("<img src='" + snapshot.val() + "'>");
    })
}


var messageField = $('#messageInput');
var nameField = authData.facebook.displayName;
var messageList = $('#example-messages');

messages = myFirebaseRef.child('messages');
messageField.keypress(function (e) {
    if (e.keyCode == 13) {
        var uid = authData.uid;
        var name = authData.facebook.displayName;
        var message = messageField.val();

        messages.push({
            uid: uid,
            name: name,
            type: null,
            timeStamp: Date.now(),
            text: message
        });
        messageField.val('');
    }
});

messages.limit(10).on('child_added', function (snapshot) {
    //GET DATA
    var data = snapshot.val();
    var userID = data.uid;
    var username = data.name;
    var message = data.text;

    var messageElement = $("<li>");
    var nameElement = $("<strong class='example-chat-username'></strong>")
    nameElement.text(username);
    messageElement.text(message).prepend(nameElement);

    messageList.append(messageElement);

    messageList[0].scrollTop = messageList[0].scrollHeight;

});


function removeProfilePicture() {
    $(".profilePicture").html("");
}

function logOut() {
    myFirebaseRef.unauth();
    removeProfilePicture();
    alert("Logged Out!");
}