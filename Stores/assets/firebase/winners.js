// Call data retrieval functions only after firebase is loaded
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showWinners()
        updateBasicInfo()
    }
})

/**
 * Fetches all the winners data for this Store present in Database
 * Passes the array to the update function which loads the data on table and initialises it
 */
async function showWinners(){
    const UID = firebase.auth().currentUser.uid;
    // const UID = 'OHatm0qKa2Rf3DFnAj1Vq64Fcn62'

    const snapshot = await firebase.database().ref(`Teqmo/Winners/${UID}`).once('value')
    const data = snapshot.val()
    var dataSet = []
    
    jQuery.each(data, function(date, allShifts) {
        // console.log(date, allShifts)
        jQuery.each(allShifts, function(shift, shiftDetails) {
            // console.log(shift, shiftDetails)
            if(shiftDetails){
              jQuery.each(shiftDetails, function(gameType, winnerDetails) {
                if (winnerDetails){
                  // Obtain the date from key and convert full date 
                  // `Wed Apr 07 2021 05:30:00 GMT+0530 (India Standard Time)`
                  // to `Wed Apr 07 2021`
                  let winDate = new Date(date)
                  // console.log(date, shift, winnerDetails, winDate)
                  winDate = winDate.toString().substring(0,15).replace(' ', ', ')

                  let shiftName = getShiftName(shift)
                  let actualNumber = winnerDetails.winNum
                  let predictions = winnerDetails.predictions.replace(/,/g, ', ')
                  let game = `TEQMO` + gameType //TEQMO3 or TEQMO4
                  let count = predictions.split(',').length
      
                  let row = [winDate, shiftName, game, actualNumber, predictions, count]
                  dataSet.unshift(row)
                }
              })
            }
        })
    })
    // console.log(dataSet)
    updateDataTable(dataSet)
}

// INITIALIZATION OF DATATABLES
function updateDataTable(dataSet){
    // Sample Data to be received (Number of items in each row should match the columns)
    // var dataSet = [
    //    ["Mon Apr 10 2021", "Morning", "TEQMO3", "123", "123, 321", "5"],
    //    ["Tue Apr 11 2021", "Afternoon", "TEQMO4", "123", "123, 321", "5"],
    // ]

    var datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
      data: dataSet,
      columns: [
          { title: "Date" },
          { title: "Shift" },
          { title: "Game" },
          { title: "Actual Number" },
          { title: "Predictions" },
          { title: "Winners Count" }
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