firebase.auth().onAuthStateChanged((user) => {
    if(user){
      console.log(user.email)
      document.getElementById('emailVerify').innerHTML = user.email;
    }
    if(user.emailVerified){
      window.location.href = './index.html'
    }
});
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
              Swal.fire({
                icon: 'error',
                title: 'Failed to sent verification email',
                text: errorMessage
              })
            });
        }
    });
}
