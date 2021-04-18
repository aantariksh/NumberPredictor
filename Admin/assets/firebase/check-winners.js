var dates = [];
for (let i = 1; i <= 7; i++) {
    dates.push(new Date(new Date().getTime() - ((7 >= 0 ? i : (i - i - i)) * 24 * 60 * 60 * 1000)).toLocaleString());
    document.getElementById("date"+i).innerHTML=dates[i-1].substring(0,dates[i-1].indexOf(','));
}
//console.log(dates)

//  function collectDetails(){
//      console.log('Hii');
// 	var x = document.getElementById("dateSelector").value;
// 	console.log(x)
// 	for(let i=1; i<=6; i++){
// 	document.getElementById("xyz"+i).innerHTML = x;}
// 	for(let i=1; i<=6; i++){
// 	document.getElementById("actual"+i).innerHTML = document.getElementById("t"+i).value;}
// }

//------------------------------------------------------------------------------

let tableData=[];

async function checkWinners(){

    let morning3=document.getElementById('morning-3').value;
    let morning4=document.getElementById('morning-4').value;
    let afternoon3=document.getElementById('afternoon-3').value;
    let afternoon4=document.getElementById('afternoon-4').value;
    let evening3=document.getElementById('evening-3').value;
    let evening4=document.getElementById('evening-4').value;

    let selectedDate=document.getElementById('selected-date').value;

    if(!selectedDate || !morning3 || !morning4 || !afternoon3 || !afternoon4 ||  !evening3 || !evening4){
        Swal.fire({
            icon: 'error',
            text: 'Please, Enter all the values'
        })
        .then(() => {
            location.reload();
        })
    }
    else{
        //date,shift,digit,winningNum
        tableData=[];
        await getResult(selectedDate,0,3,morning3);
        await getResult(selectedDate,0,4,morning4);
        await getResult(selectedDate,1,3,afternoon3);
        await getResult(selectedDate,1,4,afternoon4);
        await getResult(selectedDate,2,3,evening3);
        await getResult(selectedDate,2,4,evening4);
        console.log(tableData)
        updateWinnersTable(tableData);
    }
    
}

function isPresent(arr,allPermutations,storeResult){
    arr=arr.split(','); //arr is in string format
    for(let i=0;i<arr.length;i++){
        if(allPermutations.has(arr[i]) && !storeResult.has(arr[i])){
            storeResult.add(arr[i]);
            break;  //Taking only first occurence 
        }
    }
    return storeResult;
}

let permArr = [],usedChars = [];
function permute(input) {
	let i, ch;
  	for (i = 0; i < input.length; i++) {
	    ch = input.splice(i, 1)[0];
	    usedChars.push(ch);
	    if (input.length == 0) {
	      permArr.push(usedChars.slice());
    }
    permute(input);
    input.splice(i, 0, ch);
    usedChars.pop();
  }
  return permArr;
};

function getPermutations(winningNumber){
	let Permutations=new Set();
	let arr=[];
	for(let i=0;i<winningNumber.length;i++)
		arr.push(winningNumber[i]);
	let ans=[];
	permArr=[];usedChars=[];
	ans=permute(arr);
	for(let i=0;i<ans.length;i++){
		let num='';
		for(let j=0;j<ans[i].length;j++){
			num+=ans[i][j];
		}
		Permutations.add(num);//To take integral values, replace num with parseInt(num)
	}
	return Permutations;
}

async function Operation(date,shift,digit,winningNumber){
    let allPermutations=getPermutations(winningNumber);
    let snapshot=await firebase.database().ref(`Teqmo/Numbers/${digit}/${date}/${shift}`).once('value');
    
    if (snapshot.exists()){
        let AllStoreData=snapshot;
        AllStoreData.forEach(StoreUID => {
            let storeResult=new Set();
            StoreUID.forEach(array=>{
                let numberArray=array.val();
                storeResult=isPresent(numberArray,allPermutations,storeResult);
            })
            if(storeResult.size>0){
                storeResult=Array.from(new Set(storeResult));
                addTableRow(digit,date,shift,winningNumber,StoreUID.key,storeResult);
                insertWinningNumbers(digit,date,shift,winningNumber,StoreUID.key,storeResult);
            }
            else{
                //console.log('Not exists for that store')
            };
        });             
    }
    else {
        //console.log('Winning numbers do not exist, for particular shift of particular date')
    }
     
}


async function addTableRow(digit,date,shift,winningNumber,StoreUID,storeResult){
    let shiftName=['Morning','Afternoon','Evening'];
    let gameName='TEQMO'+digit;
    let count=storeResult.length;
    let storeName=await getStoreName(StoreUID);
    storeResult=storeResult.toString();
    let tableRow=[date,shiftName[shift],gameName,storeName,winningNumber,storeResult,count]
    tableData.push(tableRow);
}

async function getStoreName(storeUID){
    let snashot=await firebase.database().ref(`Teqmo/Stores/${storeUID}/details/OwnerName`).once('value');
    let name=snashot.val();
    return name;
}

 
async function insertWinningNumbers(digit,date,shift,winningNumber,storeUid,winningArray){
    date=date.replace('/','-').replace('/','-');
    firebase.database().ref(`Teqmo/Winners/${storeUid}/${date}/${shift}/${digit}`).set({
        'winNum':winningNumber,
        'predictions':winningArray.toString()
    });
}

async function getResult(date,shift,digit,winningNumber){
    if((digit==3 && winningNumber.length==3) || (digit==4 && winningNumber.length==4)){
        date=date.split('/');
        if(date[0].length==1) date[0]='0'+date[0];
        if(date[1].length==1) date[1]='0'+date[1];
        [date[0],date[1]]=[date[1],date[0]]
        date=date.reverse().join('/');
        Operation(date,shift,digit,winningNumber);
    }
    else{
        Swal.fire({
            icon: 'error',text: 'Please, Enter Valid numbers!'
        })
        .then(() => {
            location.reload();
        })
    }
}
 
function updateWinnersTable(dataSet){
    console.log(dataSet);
    // Sample Data to be received (Number of items in each row should match the columns)
    // let dataSet = [
    //      ["Name with HTML tags,attributes", "s1@gmail.com", "9847473823", "$ 200"],
    //      ["Name with HTML tags,attributes", "s3@gmail.com", "2334453556", "$ 300"]
    //  ]
    //dataSet=[["5/41/2255","Mor","Te3","Stire","125","123,453","7"]];
  
    let datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
      data: dataSet,
      columns: [
          { title: "Date" },
          { title: "Shift" },
          { title: "Game" },
          { title: "Store" },
          { title: "Actual Number" },
          { title: "Winning Numbers" },
          { title: "Count" }
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