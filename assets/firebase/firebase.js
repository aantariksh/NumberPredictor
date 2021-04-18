firebase.auth().onAuthStateChanged((user) => {
    if(user && window.location.href.includes('login.html')){
        window.location.href = './select-screen.html'
    }
    if(user && window.location.href.includes('select-screen.html')){
        loadScreens()
    }
});  

function login(){
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    console.log(email, password)
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
        // Signed in
    })
    .catch((error) => {
        alert(error)
    });
}

function loadScreens(){
    const UID = firebase.auth().currentUser.uid;
    firebase.database().ref(`Teqmo/Stores/${UID}/Screens`).on('value',(snapshot)=>{
        if(snapshot.exists()){
            document.getElementById('mainCard').innerHTML = ''
            const data = snapshot.val()
            jQuery.each(data, function(screenID, settings) {
                console.log(screenID, settings)
                var isDisabled = settings.loggedinStatus ? 'disabled' : ''
                var div = `<div class="btn btn-primary btn-lg btn-block mb-3 ${isDisabled}" id="${screenID}" onclick="setScreenID(this.id)">
                    Screen ${screenID}</div>`
                document.getElementById('mainCard').innerHTML += div
            });
        }
    });
}

function setScreenID(id){
    const UID = firebase.auth().currentUser.uid;
    localStorage.setItem('screenID', id)
    firebase.database().ref(`Teqmo/Stores/${UID}/Screens/${id}`).update({
        'loggedinStatus': 1
    });
    window.location.href="./playgame.html"
}

function play(){
    var id = localStorage.getItem('screenID');
    const UID = firebase.auth().currentUser.uid;

    if(id){
        firebase.database().ref(`Teqmo/Stores/${UID}/Screens/${id}/lockUnlock`).once('value',(snapshot)=>{
            var status = snapshot.val()
            if(status){
                document.getElementById('status').innerHTML = 'Please pay to play!'
            } else{
                console.log('ok')
                document.getElementById('stop').style.display = "block"
                document.getElementById('status').innerHTML = 'You can play!'
            }
        })
    }
}

function stop(){
    const UID = firebase.auth().currentUser.uid;
    firebase.database().ref(`Teqmo/Stores/${UID}/Screens/${id}`).update({
        'lockUnlock': 1
    });
    document.getElementById('stop').style.display = "none"
    document.getElementById('status').innerHTML = 'Please pay to play!'
}

async function logoutScreen(){
    var id = localStorage.getItem('screenID');
    const UID = firebase.auth().currentUser.uid;
    console.log(UID, id)
    if(!UID || !id) {return}
    await firebase.database().ref(`Teqmo/Stores/${UID}/Screens/${id}`).update({
        'loggedinStatus': 0
    });
    localStorage.removeItem('screenID')
    window.location.href="./select-screen.html"
}