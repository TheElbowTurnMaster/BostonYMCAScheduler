const puppeteer = require('puppeteer');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

async function scrapeYMCA() {
    const time = '12:30 pm';
    const url = 'https://outlook.office365.com/owa/calendar/HuntingtonFitnessCenter@ymcaboston.org/bookings/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector('[for = service_4]');
    await page.click('[for = service_4]');

    var dateDay = (new Date()).addDays(3).getDate();    
    if(dateDay <= 3) {
        await page.waitForSelector('[class="image icon-chevronRight"]');
        await page.click('[class="image icon-chevronRight"]');
    }

    var xpath = '//div[text()="' + dateDay + '"]';
    const [buttonDate] = await page.$x(xpath);
    if(buttonDate) {
        await buttonDate.click();
    }
    
    try {
        const thing =  await page.waitForXPath('//span[text()="' + time + '"]', {timeout: 10000});
     } catch(error) {
         console.log(error);
    }
    
    const [button] = await page.$x('//span[text()="' + time + '"]');
    if(button) {
        await button.click();
    }

    await page.type('[placeholder = Name', myName);
    await page.type('[placeholder = Email', email);
    await page.type('[placeholder="Phone number"]', phoneNumber);

    await page.select('#af1aa7f3-a272-4226-8ac9-815f58267c52', "Yes");

    await page.click('[type = submit]');

    browser.close();
}

scrapeYMCA();