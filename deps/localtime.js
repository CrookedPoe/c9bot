const DATE = new Date();

// Days of the Week
var dayNames = new Array(7);
dayNames[0] = "Sunday";
dayNames[1] = "Monday";
dayNames[2] = "Tuesday";
dayNames[3] = "Wednesday";
dayNames[4] = "Thursday";
dayNames[5] = "Friday";
dayNames[6] = "Saturday";

// Months in a Year
var monthNames = new Array(12);
monthNames[0] = "January";
monthNames[1] = "February";
monthNames[2] = "March";
monthNames[3] = "April";
monthNames[4] = "May";
monthNames[5] = "June";
monthNames[6] = "July";
monthNames[7] = "August";
monthNames[8] = "September";
monthNames[9] = "October";
monthNames[10] = "November";
monthNames[11] = "December";

// Time
var nowSeconds = 0;
var nowMinutes = 0;
var nowHours = 0;

var today = {
    "index": DATE.getDay(),
    "name": dayNames[DATE.getDay()]
};

var nowDate = {
    "month_index": DATE.getMonth(),
    "month_name": monthNames[DATE.getMonth()],
    "date": DATE.getDate(),
    "year": DATE.getFullYear()
};

exports.dayNames = dayNames;
exports.monthNames = monthNames;
exports.nowSeconds = nowSeconds;
exports.nowMinutes = nowMinutes;
exports.nowHours = nowHours;
exports.today = today;
exports.nowDate = nowDate;