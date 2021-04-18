$("#mainForm").submit(function(e) {
    e.preventDefault();
    generate()
    timer()
});

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

function generate(){
    document.getElementById('input').style.display = 'none';
    document.getElementById('loader').style.display = 'block';
    console.log('here')
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
}

function generateNumbers(count){
    console.log('here')
    let inp = document.getElementById('numberInput').value;
    let dig = document.getElementById('digits').value;
    let list = [0, 1, 6, 7, 8, 9, 3, 4, 2, 5].concat(inp.toString().split(''))
    let numbers = []
    console.log('here')
    while(numbers.length!=count){
        let newNum = ''
        for(i=0; i<dig; i++){
            newNum += list[getRandomInt(0, list.length-1)]
        }
        if(!numbers.includes(newNum)){
            numbers.push(newNum)
        }
    }
    console.log('here')
    return numbers
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function timer(requiredSeconds=15) {
    let i = requiredSeconds; //Seconds, keep it to 30 later
    let countDown = setInterval(async function() {
        let seconds=i;
        i--;  
        document.getElementById("timer").innerHTML = seconds;

        if(seconds <= 1){
            clearInterval(countDown);
            // document.getElementById("timer").innerHTML = "<h1>GAME OVER<h1>";
            setTimeout(()=>{
                document.getElementById("timer").innerHTML = "0";
                window.location.href="video-loop.html"; //Going back once time gets over
            },1000);

            var id = localStorage.getItem('screenID');
            var UID = sessionStorage.getItem('storeUID');
            await firebase.database().ref(`Teqmo/Stores/${UID}/screens/${id}`).update({
                'lockStatus': 1
            });
        }
    }, 1000);
}
