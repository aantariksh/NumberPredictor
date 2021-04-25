// Checks for Looged-In Teqmo Admin
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showAllStoresAllWinner()
        updateBasicInfo()
    }
})

/**
 * Fetches all the Winners from All the Stores present in Database
 * Table Format - [winDate, shiftName, game+gameType, storeName, actualNumber, predictions, count]
 */
async function showAllStoresAllWinner() {
    const snapshot = await firebase.database().ref(`Teqmo/Winners`).once('value')
    const data = snapshot.val()
    var dataSet = []
    const game = "TEQMO"

    const stores = await firebase.database().ref(`Teqmo/Stores`).once('value')
    var storeDetails = {}

    jQuery.each(stores.val(), function(UID, uidDetails) {
        storeDetails[UID] = uidDetails.details.storeName
    })

    // looping through each UID
    jQuery.each(data, function(UID, uidDetails) {
        if (uidDetails) {
            // Looping through all dates available
            jQuery.each(uidDetails, function(date, dateDetails) {
                // Looping through all shifts
                jQuery.each(dateDetails, function(shift, shiftDetails) {
                    if (shiftDetails) {
                        jQuery.each(shiftDetails, function(gameType, winners) {
                            // Obtain the dete from key and convert full date 
                            // `Wed Apr 07 2021 05:30:00 GMT+0530 (India Standard Time)`
                            // to `Wed Apr 07 2021`
                            let winDate = new Date(date)
                            winDate = winDate.toString().substring(0,15).replace(' ', ', ')
                            let shiftName = getShiftName(shift)
                            let storeName = storeDetails[UID] ? storeDetails[UID] : 'Not available'

                            let actualNumber = winners.winNum
                            let predictions = winners.predictions.replace(/,/g, ', ')
                            let count = predictions.split(',').length
                            
                            let row = [winDate, shiftName, game+gameType, storeName, actualNumber, predictions, count]
                            dataSet.unshift(row)
                        })
                    }
                })
            })
        }
    })
    console.log(dataSet)
    updateDataTable(dataSet)
}
        
function updateDataTable(dataSet) {
    var datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
        data : dataSet,
        columns:[
            { title: "Date" },
            { title: "Shift"},
            { title: "Game"},
            { title: "Store Name"},
            { title: "Actual Number"},
            { title: "Winning Numbers"},
            { title: "Count"}
        ],
        language: {
            zeroRecords: '<div class="text-center p-4">' +
                '<img class="mb-3" src="./assets/svg/illustrations/sorry.svg" alt="Image Description" style="width: 7rem;">' +
                '<p class="mb-0">No data to show</p>' +
                '</div>'
        }
    });
    // Initialise search on table
    $('#datatableSearch').on('mouseup', function (e) {
      var $input = $(this),
        oldValue = $input.val();

      if (oldValue == "") return;

      setTimeout(function(){
        var newValue = $input.val();

        if (newValue == ""){
          // Gotcha
          datatable.search('').draw();
        }
      }, 1);
    });
}
