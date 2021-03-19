exports.threeDaysFromToday = () => {
    var date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
}

exports.toWrittenDay = (day) => {
    let days = [ 
        "sunday", 
        "monday",
        "tuesday", 
        "wednesday", 
        "thursday", 
        "friday", 
        "saturday"
    ]

    return days[day]
}