const START_DATE = new Date('4/4/2021')
const SCREEN_UNLOCK = 0

/**
 * For formatting any date in MM/DD/YYYY
 * @param {string} date any date of any format 
 * @returns {string} formattedDate Date in MM/DD/YYYY format
 */
function getFormattedDate(dateReceived) {
    const date = new Date(dateReceived);
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = month + '/' + day + '/' + year;
    return formattedDate;
}

/**
 * Gives Number of days between a fixed date and current date.
 * It can be used to calculate current week number
 * @param {string} date current date in any format 
 * @returns {number} diffDays Number of days passed after Initial Fixed Date
 */
function getPassedDays(date){ 
    const newDate = new Date(getFormattedDate(date));
    const diffTime = Math.abs(newDate - START_DATE);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

/**
 * Calculates Week Number of date received
 * @param {Date} date formated date
 * @returns {number} week number of the date
 */
function getWeekNumber(date){
    const diffTime = Math.abs(date - START_DATE);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const weekNum = Math.floor(diffDays/7)+1;
    return weekNum
}

/**
 * Gives Starting & Ending date of Week in DD/MM/YYYY format   
 * @param {Number} weekNum Week number of which we want to find Starting & Ending Date
 * @param {Number} startOrEnd 0 => StartDate , 1 => End Date
 * @returns {string} if startOrEnd = 0 then Starting date, else Ending date of that week
 */
function getDateFromWeek(weekNum,startOrEnd){
    let daysPassed=(weekNum-1)*7;
    let result = new Date('4/4/2021');
    if(startOrEnd==1)
        daysPassed+=6;
    
    result.setDate(result.getDate() + daysPassed);
    // let month = (1 + result.getMonth()).toString().padStart(2, '0');
    // let day = result.getDate().toString().padStart(2, '0');
    // let year = result.getFullYear();
    return result.toString().substring(4,15)
}

function getShiftName(shiftNumber){
    if(shiftNumber == "0") {return "Morning"}
    if(shiftNumber == "1") {return "Afternoon"}
    if(shiftNumber == "2") {return "Evening"}
    return "No Info Available"
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

/**
 * Calculates shift name according to given time
 * @param {string} time in HHMMSS & 24 hours format e.g. 180510  
 * @returns {string} Morning, Afternoon, Evening
 */
 function getGreeting(time) {
    let hours = time.substring(0, 2);
    let minutes = time.substring(2, 4);
    let seconds = time.substring(4, 6);
    time = parseInt(hours + minutes + seconds);
    if (time <= 120000) return "morning";
    else if (time <= 160000) return "afternoon";
    else return "evening";
}

/**
 * Updates the basic user info whatever is available on the page
 * Eg. Top left profile icon details
 */
async function updateBasicInfo(){
    const UID = firebase.auth().currentUser.uid;
    var snapshot = await firebase.database().ref(`Teqmo/Stores/${UID}/details`).once('value')
    var details = snapshot.val()

    const userName = details.ownerName ? details.ownerName : 'No Owner Name'
    const userEmail = details.email ? details.email : 'No Valid Email'

    var profileName = document.getElementById('profileName')
    if(profileName){
        profileName.innerHTML = userName
    }

    var profileEmail = document.getElementById('profileEmail')
    if(profileEmail){
        profileEmail.innerHTML = userEmail
    }

    var todaysDate = document.getElementById('todaysDate')
    if(todaysDate){
        var date = new Date()
        date = date.toString().substring(0,15)
        todaysDate.innerHTML = `<i class="tio-date-range"></i> ${date}`
    }

    var greeting = "Good " + getGreeting(getCurrentTime());
    
    var welcomeName = document.getElementById('welcomeName')
    if(welcomeName){
        welcomeName.innerHTML = `${greeting}, ${userName}!`
    }
}