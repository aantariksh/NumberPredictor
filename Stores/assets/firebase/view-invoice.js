// Call data retrieval functions only after firebase is loaded
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const storeUID = user.uid
        const weekNum = location.search.split('=')[1];
        generateInvoice(storeUID, weekNum)
        updateBasicInfo()
    }
})

async function invoiceInfo(storeUID) {
    document.getElementById('invoiceDate').innerHTML = '[INVOICE DATE]';
    document.getElementById('dueDate').innerHTML = '[DUE DATE]';

    let snapshot = await firebase.database().ref(`Teqmo/Stores/${storeUID}/details`).once('value')
    let data = snapshot.val()

    let ownerName = data.ownerName ? data.ownerName : " "
    let storeName = data.storeName ? data.storeName : " "

    let addressLine = data.address ? data.address + ",<br>" : " "
    let city = data.city ? data.city + (data.zipCode ? " - " : ",<br>") : " "
    let zipCode = data.zipCode ? data.zipCode + "<br>" : " "
    let state = data.state ? data.state : " "

    let storeAddress = `${addressLine}${city}${zipCode}${state}`;

    document.getElementById('ownerName').innerHTML = ownerName
    document.getElementById('storeName').innerHTML = storeName
    document.getElementById('address').innerHTML = storeAddress
}

async function generateInvoice(storeUID, weekNum) {

    if (!weekNum || weekNum >= getWeekNumber(new Date(getFormattedDate(new Date())))) {
        showFailError('Invoice does not exist')
        return
    }

    let snapshot = await firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/weeks/${weekNum}`).once('value')
    if (snapshot.exists()) {
        let data = snapshot.val()
        
        if (data.billStatus == 0) {
            showFailError('Bill not generated yet!')
            return
        }
        invoiceInfo(storeUID)
        let startingDay = getDateFromWeek(weekNum, 0);
        let endingDay = getDateFromWeek(weekNum, 1);
        let playCount = data.counter.reduce((a, b) => a + b, 0)
        let sale = data.sales.toFixed(2)
        let commissionRate = ((data.commission * 100) / sale).toFixed(2)
        let amountToPay = data.commission.toFixed(2)
        //console.log(weekStartingDay,weekEndingDay,weekCount,weekSale,weekCommissionRate,amountToPay)
        let tableRow = `<tr>
                        <td>${startingDay} - ${endingDay}</td>
                        <td>${playCount}</td>
                        <td>$ ${sale}</td>
                        <td>${commissionRate} %</td>
                        <td class="table-column-right-aligned">$ ${amountToPay}</td>
                     </tr>`;
        document.getElementById('tableData').innerHTML = tableRow
    
    } else {
        showFailError('Invoice not available !')
    }
}

function showFailError(msg) {
    let err = msg ? msg : 'Some error occured, Please try again later!'
    Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `${err}`,
            allowOutsideClick: false
        })
        .then(function () {
            history.back()
            //location.reload();
        });
}