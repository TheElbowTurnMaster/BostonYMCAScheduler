const info = require('./personal-info.js');
const puppeteer = require('puppeteer');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

async function scrapeYMCA() {
    const times = ['12:30 pm','12:00 pm'];

    function timeXPath(time) {
        return '//span[text()="' + time + '"]';
    }
    const url = 'https://outlook.office365.com/owa/calendar/HuntingtonFitnessCenter@ymcaboston.org/bookings/';
    const browser = await puppeteer.launch({headless : true});
    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector('[for = service_4]');
    await page.click('[for = service_4]');

    var dateDay = (new Date()).addDays(3).getDate();    
    if(dateDay <= 3) {
        await page.waitForSelector('[class="image icon-chevronRight"]');
        await page.click('[class="image icon-chevronRight"]');
    }

    let xpath = '//div[text()="' + dateDay + '"]';
    const [buttonDate] = await page.$x(xpath);
    if(buttonDate) {
        await buttonDate.click();
    }

    await page.waitForXPath('//div[@class="focusable timePicker"]/ul/li');
    let availableTimeElements = await page.$x('//div[@class="focusable timePicker"]/ul/li');
    let availableTimes = await page.evaluate((...availableTimeElements) => {
        return availableTimeElements.map(e => e.innerText);
    }, ...availableTimeElements);

    for(let i = 0; i < availableTimes.length; i++) {
        if(times.includes(availableTimes[i])) {
            availableTimeElements[i].click();
            break;
        }
    }

    await page.focus('[placeholder = Name]');
    await page.type('[placeholder = Name]', info.info.myName);
    await page.type('[placeholder = Email]', info.info.email);
    await page.type('[placeholder="Phone number"]', info.info.phoneNumber);

    await page.select('#af1aa7f3-a272-4226-8ac9-815f58267c52', "Yes");

    await page.click('[type = submit]');

    browser.close();
}

scrapeYMCA();