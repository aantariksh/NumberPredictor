// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBFwJkHQHb4IuU0Xuloba3d9FSZayB1eqw",
  authDomain: "numberpredictor-prd.firebaseapp.com",
  databaseURL: "https://numberpredictor-prd-default-rtdb.firebaseio.com",
  projectId: "numberpredictor-prd",
  storageBucket: "numberpredictor-prd.appspot.com",
  messagingSenderId: "333354525993",
  appId: "1:333354525993:web:b8b713f2e609d9c545c338"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/** 
 * Shows dashboard pages only if a user is logged in
 * Redirects to auth pages if not
*/
firebase.auth().onAuthStateChanged((user) => {
    const authPages = ['login', 'signup', 'forgot-password']
    var currentPage = window.location.pathname.split('/')
    var currentPage = currentPage[currentPage.length-1].split('.')[0]

    if (user && authPages.includes(currentPage)) {
      if (user.emailVerified) {
        //user signed in and email verified
        window.location.href = '../index.html'
       } else {
        //user signed in but email not verified
        window.location.href = '../email-verify.html'
        }
      } 
    else if(!user && !authPages.includes(currentPage)) {
      // User is NOT signed in, redirecting to auth page
      window.location.href = './auth/login.html'
    }
});  

function login(){
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
        // Signed in
        // TODO: Check if logged in user has the permission to view Store pages
        // If not log out and display appropriate message.
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${errorCode} ${errorMessage}`,
        }).then(function(){
          location.reload();
        })
    });

    // Update the button description after click
    const button = document.getElementById('loginButton')
    button.disabled = true
    button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
}

function logout(){
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
  }).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(`${errorCode} ${errorMessage}`)
  });
}

function resetPassword(){
  var emailAddress = document.getElementById('email').value
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
    Swal.fire({
      icon: 'success',
      title: 'Email Sent',
      text: 'Reset link has been shared with you on email!',
    })
  }).catch(function(error) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: `${error}`,
    })
  });

  // Update the button description after click
  const button = document.getElementById('resetButton')
  button.disabled = true
  button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
}

//Send Email Verification Link
function verify(){
  firebase.auth().onAuthStateChanged(function(user) {
     if (user) {
        user.sendEmailVerification().then(function(){
          Swal.fire({
            icon: 'success',
            title: 'Email Sent',
            text: 'Verification link has been shared with you on email!',
          })
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode, errorMessage);
          });
    }
});
}

function pageCheck(){
  firebase.auth().onAuthStateChanged((user) => {
    if(user){
      console.log(user.email)
      document.getElementById('emailVerify').innerHTML = user.email;
    }
    if(user.emailVerified){
      window.location.href = './index.html'
    }
  });
}
