

export function logSum(start:Int, end:Int):Double {

	let sum:Double = 0.0;
    let p:Int = 0;
    let q:Int = 0
    let i:Int = 0;
    let count:Int = 0;
    for (i=start; i<count; i=i+1) {
        for (p = start/8, q = end/8; p<q; p = p+8) {
            sum = sum + 10.0;
        }
    }

	return sum;
}


export function geometricMean(start:Int, end:Int):Double {

    var t1:Double = 0.0;
    var t2:Double = 0.0;
    var xx:Double = 0.0;
    
    xx = logSum(1, 2);

    return logSum(start, end);



}
