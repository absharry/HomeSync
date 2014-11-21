var myFirebaseRef = new Firebase("https://boiling-torch-2013.firebaseio.com/");

var isNewUser = true;

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

function removeProfilePicture() {
    $(".profilePicture").html("");
}

function logOut() {
    myFirebaseRef.unauth();
    removeProfilePicture();
    alert("Logged Out!");
}