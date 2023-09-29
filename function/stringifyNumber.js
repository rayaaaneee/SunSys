export const stringifyNumber = (number) => {
    // Ex : 1000000 retourne "1.000.000"
    // Ex : 98250,2 retourne "98.250,2"
    let numberString = number.toString();
    let numberArray = numberString.split(".");
    let numberStringified = "";
    let counter = 0;
    for (let i = numberArray[0].length - 1; i >= 0; i--) {
        counter++;
        numberStringified = numberArray[0][i] + numberStringified;
        if (counter === 3 && i !== 0) {
            numberStringified = "." + numberStringified;
            counter = 0;
        }
    }
    if (numberArray[1]) {
        numberStringified += "," + numberArray[1];
    }
    return numberStringified;
}