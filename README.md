# NumberPredictor
Main repository for Number Predictor App

#### Points which have potential to create a bug

1. Make sure there exists a dummy key having "string" datatype in Teqmo/Details/weeks/ <br>
   Reason: If dummy key is not inserted, Firebase will convert that branch into "Array" of week-numbers, starting from 0,1,... which will eventually give incorrect results in Admin=>generated-bill=>select-week 
 
2. Similary, Make sure a key having "string" data type exists in Teqmo/Stores/payment/weeks/ <br>  in this case we have "start":weekNum
3. Keys must not contain '/', '.', '#', '$', '[',']' or any special characters e.g. Fractional values cannot be used as keys
4. toFixed() method converts a number datatype into string datatype. So after calling toFixed(), Make sure to call paserInt()/parseFloat() before performing any arithmatical operation

