/**
 * This Event will be called once valid digit number is entered i.e. Game gets started
 * Three Main Functions:
 * 1. Generate the numbers
 * 2. Store numbers on database
 * 3. Lock the screen again 
 */
$("#mainForm").submit(function(e) {
    e.preventDefault();
    timer(32);
    const generatedNumbers = generate()
    const storeUID = localStorage.getItem('storeUID');

    insertArray(storeUID, generatedNumbers);
});

// Checks input length for autosubmit
function checkLength(ele){
    var fieldLength = ele.value.length;
    var len = document.getElementById('digits').value;
    if(fieldLength < len){
        return true;
    }
    else{
        $("#mainForm").submit()
    }
}

/**
 * Adds all the generated numbers to UI
 * @returns {Array} Array of all the generated numbers 
 */
function generate(){
    document.getElementById('input').style.display = 'none';
    document.getElementById('loader').style.display = 'block';

    var numbers = generateNumbers(25)
    for(i=0; i<5; i++){
        var result = ''
        for(j=0; j<5; j++){
            result += '<br>' + numbers[i*5+j]
        }
        document.getElementById('card' + (i+1)).innerHTML = result
    }
    setTimeout(() => {  
        document.getElementById('loader').style.display = 'none';
        // getElementById('output'). removeAttribute("style");
        document.getElementById('output').style.display = ''; 
    }, 3000);

    return numbers
}

function generateNumbers(count){
    let inp = document.getElementById('numberInput').value;
    let dig = document.getElementById('digits').value;
    let list = [0, 1, 6, 7, 8, 9, 3, 4, 2, 5].concat(inp.toString().split(''))
    let numbers = []
    while(numbers.length!=count){
        let newNum = ''
        for(i=0; i<dig; i++){
            newNum += list[getRandomInt(0, list.length-1)]
        }
        if(!numbers.includes(newNum)){
            numbers.push(newNum)
        }
    }

    return numbers
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function timer(seconds=15) {
    let countDown = setInterval(async function() {
        document.getElementById("timer").innerHTML = seconds;
        seconds--;
        if(seconds <= 1){
            clearInterval(countDown);
            var id = localStorage.getItem('screenID');
            var UID = localStorage.getItem('storeUID');
            await firebase.database().ref(`Teqmo/Stores/${UID}/screens/${id}`).update({
                'lockStatus': 1
            });

            setTimeout(()=>{
                document.getElementById("timer").innerHTML = "0";
                window.location.href="video-loop.html"; //Going back once time gets over
            },2000);
        }
    }, 1000);
}

/*
* Inserts generated array according to digit, date, shift, store
* @param {Number} storeUID UID of StoreOwner, fetching from session-storage
* @param {Array} numberArray Array of generated numbers
*/
function insertArray(storeUID, numberArray) {
    let date = new Date().toISOString().slice(0, 10).replace('-', '/').replace('-', '/');
    let time = getCurrentTime();
    let shift = calculateShift(time); //Calculate shift
    let digit = location.search.split('=')[1];

    if (shift != -1) {
        let Ref = firebase.database().ref(`Teqmo/Numbers/${digit}/${date}/${shift}/${storeUID}`).push();
        firebase.database().ref(`Teqmo/Numbers/${digit}/${date}/${shift}/${storeUID}`).update({
            [Ref.key]: numberArray.toString()
        }, (error) => {
            if (!error) {
                console.log('numberArray inserted Successfully!')
            }
        });
    } else {
        console.log("Invalid Shift => can't insert number");
    }
}

/**
 * Calculates shift name according to given time
 * @param {string} time in HHMMSS & 24 hours format e.g. 180510  
 * @returns {Number} Shift name 1:Morning, 2:Afternoon, 3:Evening
 */
function calculateShift(time) {
    let hours = time.substring(0, 2);
    let minutes = time.substring(2, 4);
    let seconds = time.substring(4, 6);
    time = parseInt(hours + minutes + seconds);
    if (time <= 122959) return 0;
    else if (time <= 185959) return 1;
    else if (time <= 233459) return 2;
    else return -1;
}

/**
 * Gives current time  
 * @returns {string} time ,current time in HHMMSS & 24 hours format e.g. 180254
 */
function getCurrentTime() {
    let d = new Date(); // Current 
    let hourString = ((d.getHours() <= 9) ? '0' : '') + d.getHours().toString();
    let minuteString = ((d.getMinutes() <= 9) ? '0' : '') + d.getMinutes().toString();
    let secondString = ((d.getSeconds() <= 9) ? '0' : '') + d.getSeconds().toString();
    let time = hourString + minuteString + secondString;
    return time;
}
