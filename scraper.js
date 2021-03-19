const { myName, email, phoneNumber } = require('./personal-info.js');
const { threeDaysFromToday, toWrittenDay } = require('./utils');
const puppeteer = require('puppeteer');

async function scrapeYMCA(dates) {
    const workoutDate = threeDaysFromToday()
    const workoutTime = dates[toWrittenDay(workoutDate.getDay())]
    if(!workoutTime) {
        return {
            notBookingDay: true,
            bookingSuccessful: false,
        };
    }

    const url = 'https://outlook.office365.com/owa/calendar/HuntingtonFitnessCenter@ymcaboston.org/bookings/';
    const browser = await puppeteer.launch({headless : true});
    const page = await browser.newPage();
    await page.goto(url);


    await page.waitForXPath("//span[contains(text(),'Free Weights')]");
    const [freeWeightButton] = await page.$x("//span[contains(text(),'Free Weights')]");
    if(freeWeightButton) {
        await freeWeightButton.click();
    }

    const dateDay = workoutDate.getDate();
    let dateXPath = '//div[text()="' + dateDay + '"]';
    if(dateDay <= 3) {
        await page.waitForSelector('[class="image icon-chevronRight"]');
        await page.click('[class="image icon-chevronRight"]');
        await page.waitForXPath(dateXPath);
    }

    const [buttonDate] = await page.$x(dateXPath);
    if(buttonDate) {
        await buttonDate.click();
    }

    await page.waitForXPath('//div[@class="focusable timePicker"]/ul/li');
    let availableTimeElements = await page.$x('//div[@class="focusable timePicker"]/ul/li');
    let availableTimes = await page.evaluate((...availableTimeElements) => {
        return availableTimeElements.map(e => e.innerText);
    }, ...availableTimeElements);

    const timeSlot = await availableTimes.findIndex(time => time == workoutTime);
    if(timeSlot != -1) {
        await availableTimeElements[timeSlot].click();
    }

    await page.focus('[placeholder = Name]');
    await page.waitForTimeout(100);
    await page.type('[placeholder = Name]', myName);
    await page.type('[placeholder = Email]', email);
    await page.type('[placeholder="Phone number"]', phoneNumber);

    await page.select('#af1aa7f3-a272-4226-8ac9-815f58267c52', "Yes");

    await page.click('[type = submit]');

    const bookingSuccessful = await page
        .waitForSelector('[class="image charm icon-email circle"]', )
        .then(() => true)
        .catch(() => false);

    browser.close();

    return {
        bookingSuccessful: bookingSuccessful,
        dayOfWeek: workoutDate.getDay(),
        time: workoutTime
    }
}

scrapeYMCA({
    monday: "2:30 pm",
    thursday: "12:30 pm",
    saturday: "12:30 pm"
}).then((result) => console.log(result));