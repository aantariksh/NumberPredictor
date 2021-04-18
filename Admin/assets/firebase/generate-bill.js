firebase.auth().onAuthStateChanged((user) => {
    if(user){
        listUnbilledWeeks();
        updateBasicInfo()
    }
})

/**
 * Gives all the weeks, For which bill is not generated
 */
async function listUnbilledWeeks() {
    const snapshot = await firebase.database().ref(`Teqmo/Details/commissionRate`).once('value')
    const data = snapshot.val()
    let weeksDone = new Set();
    if (data) {
        jQuery.each(data, (commission, weeks) => {
            let tempArray = weeks.split(',')
            for (let i=0; i<tempArray.length; i++) {
                weeksDone.add(parseInt(tempArray[i]));
            }
        })
    }
    let currentWeek = getWeekNumber(new Date(getFormattedDate(new Date()))); //Current Week Number
    
    for (let i=1; i<currentWeek; i++) {
        if (!weeksDone.has(i)) {
            let startDate = getDateFromWeek(i,0);
            let endDate = getDateFromWeek(i,1);
            let row = `<option value="${startDate}">${startDate} - ${endDate}</option>`
            document.getElementById('select-week').innerHTML += row;         
        }
    }
}

/**
 * Generates Bills for all the stores for selected week 
 * Commission Rate will be same for all the stores for that week
 */
function generateBillForAllStores(){
    let weekNum = getWeekNumber(new Date(document.getElementById('select-week').value));
    let commissionRate = parseInt(document.getElementById('commissionRate').value);
    
    if(!weekNum){Swal.fire({icon: 'error',text: 'Please, select a week',})}
    else if(!commissionRate){Swal.fire({icon: 'error',text: 'Please, Enter commission rate',})}

    saveCommissionRate(weekNum,commissionRate);

    let fees=1; //Money required to play game one time

    firebase.database().ref(`Teqmo/Stores`).get().then(function(snapshot){
        const data = snapshot.val()
        jQuery.each(data, function(UID,uidDetails) {
            if (uidDetails) {
                let check = uidDetails.Payment.Weeks
                jQuery.each(check, function(weekNumber, weekDetails) {
                    if(weekNumber==weekNum){
                        if (weekDetails) {
                            //let billStatus = weekDetails.billStatus;
                            let countSum=(weekDetails.counter)?weekDetails.counter.reduce((a, b) => a + b, 0):0;
                            let Sales=countSum*fees;
                            let Commission=((Sales*commissionRate)/100).toFixed(2);//Upto two decimal places
                            updateBillValues(UID,Sales,Commission,weekNum);
                        }
                    }
                })
            }
        })
    });
}

/**
 * Saves Commission rate for selected week 
 * This can be useful to check, if bill is already generated or not for that week
 * @param {Number} weekNum week number of selected week 
 * @param {Number} commissionRate commission rate in %
 */

function saveCommissionRate(weekNum,commissionRate){
    firebase.database().ref(`Teqmo/Details/commissionRate/${commissionRate}`).get().then(function(snapshot){
        let data=(snapshot.exists())?`${snapshot.val()},${weekNum.toString()}`:weekNum.toString();
        firebase.database().ref(`Teqmo/Details/commissionRate`).child(commissionRate).set(data);
    });
}

/**
 * Updates Sales,Commission values for that store for selected week
 * Same values are used to increment total values
 * @param {Number} storeUID UID of a store 
 * @param {Number} Sales Sales for selected week
 * @param {Number} Commission Commission for selected week
 * @param {Number} weekNum Week number of selected week
 */
async function updateBillValues(storeUID,Sales,Commission,weekNum){
    firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/weeks/${weekNum}`).update({
        'billStatus':1,     //1 : Generated & Unpaid
        'commission':Commission,
        'sales':Sales
    });

    //Updating total 
    let totalCommission=await firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/totalCommission`).once('value');
    let totalSales=await firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/totalSales`).once('value');
    totalCommission=totalCommission.val()+Commission;
    totalSales=totalSales.val()+Sales;
    
    firebase.database().ref(`Teqmo/Stores/${storeUID}/payment`).update({
        'totalCommission':totalCommission,
        'totalSales':totalSales
    });

    Swal.fire({
        icon: 'success',
        text: 'Bills generated Successfully!'
    }).then(() => {
        location.reload();
    })
}
 