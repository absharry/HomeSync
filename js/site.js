var myFirebaseRef = new Firebase("https://boiling-torch-2013.firebaseio.com/");

var isNewUser = true;
var authData = myFirebaseRef.getAuth();

myFirebaseRef.onAuth(function (authData) {
    if (authData && isNewUser) {
        myFirebaseRef.child('users').child(authData.uid).set(authData);
        $(".logInButton").attr("onClick", "logOut()");
        $(".logInButton").html("Log Out!");
        viewProfilePicture(authData);
    } else {
        $(".logInButton").attr("onClick", "logIn()");
        $(".logInButton").html("Login!");
    }
});

function logIn() {
    myFirebaseRef.authWithOAuthPopup("facebook", function (err, authData) {
        if (err) {
            if (err.code === "TRANSPORT_UNAVAILABLE") {
                myFirebaseRef.authWithOAuthRedirect("facebook", function (err, authData) {
                    this.authData = authData;
                })
            }
        }
    });
}

function checkIfHouseExists() {
    var houseName = $("#houseName");
    var houseRef = myFirebaseRef.child("houses");

    houseRef.child(houseName).once('value', function (snapshot) {
        var exists = (snapshot.val() !== null);
        userExistsCallback(userId, exists);
    });
}

function addHouse() {
    var houseRef = myFirebaseRef.child("houses");
    var nickname = $("#houseNickName");
    var AddressFirstLine = $("#AddressFirstLine");
    var AddressTown = $("#AddressTown");
    var AddressCounty = $("#AddressCounty");
    var AddressPostCode = $("#AddressPostCode");
    
    var newHouse = houseRef.push({
        nickname: nickname.val(),
        firstLine: AddressFirstLine.val(),
        town: AddressTown.val(),
        county:AddressCounty.val(),
        postcode:AddressPostCode.val()
    });
    
    var uid = newHouse.key();
    
    newHouse.update({
        uid: uid
    });
}

function houseDetails() {

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
        //FIELD VALUES
        var uid = authData.uid;
        var name = authData.facebook.displayName;
        var message = messageField.val();

        messages.push({
            uid: uid,
            name: name,
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