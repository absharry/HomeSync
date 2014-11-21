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
        var username = authData.uid;
        var message = messageField.val();

        messages.push({
            name: username,
            text: message
        });
        messageField.val('');
    }
});

messages.limit(10).on('child_added', function (snapshot) {
    //GET DATA
    var data = snapshot.val();
    var userID = data.name
    var message = data.text;
    
    var username;
    
    myFirebaseRef.child('users').child(userID).child('facebook').child('displayName').on("value",function(snapshot){
        username = snapshot.val();
    });
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