const { threeDaysFromToday, toWrittenDay } = require('./utils');
require('dotenv').config();
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

    await clickXPath(page, "//span[contains(text(),'Free Weights')]");

    const dateDay = workoutDate.getDate();
    let dateXPath = '//div[text()="' + dateDay + '"]';
    if(dateDay <= 3) {
        await page.waitForSelector('[class="image icon-chevronRight"]');
        await page.click('[class="image icon-chevronRight"]');
    }
    await clickXPath(page, dateXPath);

    await page.waitForXPath('//div[@class="focusable timePicker"]/ul/li');
    let availableTimeElements = await page.$x('//div[@class="focusable timePicker"]/ul/li');
    let timeSlot = await page.evaluate((workoutTime, ...availableTimeElements) => {
        return availableTimeElements
            .map(e => e.innerText)
            .findIndex(time => time == workoutTime);
    }, workoutTime, ...availableTimeElements);
    if(timeSlot != -1) {
        await availableTimeElements[timeSlot].click();
    }

    await page.focus('[placeholder = Name]');
    await page.waitForTimeout(100);
    await page.type('[placeholder = Name]', process.env.NAME);
    await page.type('[placeholder = Email]', process.env.EMAIL);
    await page.type('[placeholder="Phone number"]', process.env.PHONE_NUMBER);

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

async function clickXPath(page, xpath) {
    await page.waitForXPath(xpath);
    const [button] = await page.$x(xpath);
    if(button) {
      await button.click();
    }
  }

// scrapeYMCA({
//     tuesday: "2:30 pm",
//     thursday: "1:30 pm",
//     saturday: "1:30 pm"
// }).then((result) => console.log(result));