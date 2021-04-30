firebase.auth().onAuthStateChanged((user) => {
    if(user){
        updateInvoiceDate();
        listUnbilledWeeks();
        updateBasicInfo();
    }
})
 
function updateInvoiceDate() {
    let date = new Date()
    let invoiceDate = date.toDateString()
    document.getElementById('invoiceDate').value = invoiceDate;
    document.getElementById('invoiceDate').disabled = true;
}

/**
 * Gives all the weeks, For which bill is not generated
 */
async function listUnbilledWeeks() {
    const snapshot = await firebase.database().ref(`Teqmo/Details/weeks`).once('value')
    const data = snapshot.val()
    let weeksDone = new Set();
    if (data) {
        jQuery.each(data,(weekNum)=>{
            weeksDone.add(parseInt(weekNum))
        })
    }
    let currentWeek = getWeekNumber(new Date()); //Current Week Number

    for (let i=1; i < currentWeek; i++) {
        if (!weeksDone.has(i)) {
            let startDate = getDateFromWeek(i, 0);
            let endDate = getDateFromWeek(i, 1);
            let row = `<option value="${i}">${startDate} - ${endDate}</option>`
            document.getElementById('select-week').innerHTML += row;
        }
    }
}

/**
 * Generates Bills for all the stores for selected week 
 * Commission Rate will be same for all the stores for that week
 */
async function generateBillForAllStores() {

    // Update the button description after click
    const button = document.getElementById('generateButton')
    button.disabled = true
    button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...`

    let weekNum = document.getElementById('select-week').value;
    let commissionRate = document.getElementById('commissionRate').value;
    let ticketValue = document.getElementById('ticketValue').value;
    let invoiceDate = document.getElementById('invoiceDate').value;
    let dueDate = document.getElementById('dueDate').value;
    
    if (weekNum == 'select') {
        showFailError('Please select a week!')
        return
    } else if (!commissionRate) {
        showFailError('Please enter Commission rate!')
        return
    } else if (!ticketValue) {
        showFailError('Please enter Ticket value!')
        return
    }
    else if(!dueDate){
        showFailError('Please select due date!')
        return
    }
    else if(dueDate && Math.ceil((new Date(dueDate).getTime()-new Date().getTime()) / (1000 * 60 * 60 * 24)) < 1){
        showFailError('Due date should be greater than invoice date!')
        return
    } 
    else if(commissionRate.includes('.') || parseInt(commissionRate)<0 || parseInt(commissionRate)>100){
        showFailError('Please, Enter Commission Rate between 0 to 100 without decimal point')
        return
    }
    commissionRate = parseInt(commissionRate);
    ticketValue = parseFloat(ticketValue);
    dueDate = new Date(dueDate).toDateString()

    await firebase.database().ref(`Teqmo/Stores`).get().then(function (snapshot) {
        const data = snapshot.val()

        jQuery.each(data, function (UID, uidDetails) {
            if (uidDetails) {
                let check = uidDetails.payment.weeks
                jQuery.each(check, function (weekNumber, weekDetails) {
                    if (weekNumber == weekNum) {
                        try{
                            if (weekDetails) {
                                //let billStatus = weekDetails.billStatus;
                                let countSum = (weekDetails.counter) ? weekDetails.counter.reduce((a, b) => a + b, 0) : 0;
                                let sales = countSum * ticketValue;
                                let commission = ((sales * commissionRate) / 100).toFixed(2); //Upto two decimal places
                                sales = parseFloat(sales)
                                commission = parseFloat(commission)
                                updateBillValues(UID, sales, commission, weekNum);
                            }
                        }
                        catch (err) {
                            console.log(err, UID, weekNum)
                        }
                    }
                })
            }
        })
    }).then(()=>{
        saveBillDetails(weekNum,commissionRate,dueDate,invoiceDate,ticketValue);
        showSuccessMsg()
    }).catch((error)=>{
        console.log(error)
        showFailError('Something went wrong, please try again')
    });
}

/**
 * Saves Bill details for selected week 
 * This can be useful to check, if bill is already generated or not for that week
 */
function saveBillDetails(weekNum,commissionRate,dueDate,invoiceDate,ticketValue) {
    console.log(weekNum,commissionRate,dueDate,invoiceDate,ticketValue)
    firebase.database().ref(`Teqmo/Details/weeks`).child(weekNum).set({
        "commissionRate":commissionRate,
        "dueDate":dueDate,
        "invoiceDate":invoiceDate,
        "ticketValue":ticketValue
    })
}

/**
 * Updates sales,commission values for that store for selected week
 * Same values are used to increment total values
 * @param {Number} storeUID UID of a store 
 * @param {Number} sales Sales for selected week
 * @param {Number} commission Commission for selected week
 * @param {Number} weekNum Week number of selected week
 */
async function updateBillValues(storeUID, sales, commission, weekNum) {
    firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/weeks/${weekNum}`).update({
        'billStatus': 1, //1 : Generated & Unpaid
        'commission': commission,
        'sales': sales
    });

    //Updating total 
    let totalCommission = await firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/totalCommission`).once('value');
    let totalSales = await firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/totalSales`).once('value');
    totalCommission = parseFloat(totalCommission.val()) + parseFloat(commission);
    totalSales = parseFloat(totalSales.val()) + parseFloat(sales);

    firebase.database().ref(`Teqmo/Stores/${storeUID}/payment`).update({
        'totalCommission': totalCommission,
        'totalSales': totalSales
    });
}

// Function to display fail messages
function showFailError(msg) {
    let err = msg ? msg : 'Please try again later! If the problem persist contact the Developer.'
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `${err}`,
        allowOutsideClick: false
    }).then(() => {
        location.reload()
    })
}

function showSuccessMsg(msg){
    Swal.fire({
        icon: 'success',
        text: 'Bills generated Successfully!'
    }).then(() => {
        location.reload();
    })
}

