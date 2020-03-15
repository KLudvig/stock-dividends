document.getElementById("clickMe").addEventListener("click", run);

function run(){
    let tickerSymbol = document.getElementById('tickerSymbol').value //ticker symbol for the stock
    let keyAPI = 'Add API Key' //Add API key from Alpha Vantage. Note for security: In a real application this would be called in the backend so it cant be seen.
    
    //URL DATA 1 (for price)
    const urlData1 = { 
      url: 'https://www.alphavantage.co/query?function=',
      theFunction: 'TIME_SERIES_DAILY', 
      symbol: tickerSymbol, 
      apiKey: keyAPI, 
      outputsize: 'compact'
  };
    const {url,theFunction,symbol,apiKey, outputsize} = urlData1
    const apiUrl1 = `${url}${theFunction}&symbol=${symbol}&outputsize=${outputsize}&apikey=${apiKey}`;
    const fetch1Price = fetch(apiUrl1) //Fetch for price

    //URL DATA 2 (for dividends)
    const urlData2 = { 
      url2: 'https://www.alphavantage.co/query?function=',
      theFunction2: 'TIME_SERIES_MONTHLY_ADJUSTED', 
      symbol2: tickerSymbol, 
      apiKey2: keyAPI 
    };
    const {url2,theFunction2,symbol2,apiKey2} = urlData2
    const apiUrl2 = `${url2}${theFunction2}&symbol=${symbol2}&apikey=${apiKey2}`;
    const fetch2Dividend = fetch(apiUrl2) //Fetch for dividend

Promise.all([fetch1Price, fetch2Dividend]) //wait until both fetch data is finished
.then((file) => {
  let priceFile = file[0].json() 
  let dividendFile = file[1].json() 
  return Promise.all([priceFile, dividendFile]) 
})
.then(([priceFile, dividendFile]) => getPriceAndDividends([priceFile, dividendFile])) //get dividends and price from the data
.then(([dividend, price]) => createHTML([dividend, price])) //display the data with HTML.


//Function to get price and dividends from the data
const getPriceAndDividends = ([priceFile, dividendFile]) => {

//Get price
let getPrice = new Promise(function(resolve, reject){
  let priceArray = Object.entries(priceFile['Time Series (Daily)']) //Object.entries makes the object iterable as an array
  let price = parseFloat(priceArray['0']['1']['4. close']);         //Gets the latest price
    console.log('price: '+ price)
    resolve(price)
}).catch((err) => {
  console.log(err)
});

//Get Yearly Dividends
let getDividend = new Promise(function(resolve, reject){
    let objArray = Object.entries(dividendFile['Monthly Adjusted Time Series']) //1. Object.entries makes the object iterable as an array
    let dividendArray = [];                                                     //2. Empty array to hold the dividends
    let i = 1                                                                   //3. Get dividends for the year. "i" starts at one because we want to get dividends from the last month and one year back, not from this month
    while(i<=12) {
    dividendArray.push(parseFloat(objArray[i]['1']["7. dividend amount"]))
    i++
    }

    let dividend = dividendArray.reduce((accumulator, currentValue) => {        //4. Sum the dividends
      return accumulator + currentValue;
    });
    console.log('dividend: ' + dividend)
    resolve(dividend)
  })
  .catch((err) => {
    console.log(err)
  });
  return Promise.all([getDividend, getPrice]); 
}

//Function to create HTML
const createHTML = ([dividend, price]) => {

//convert to two decimals for display at html (not for use in calculation)
let theDividend = dividend.toFixed(2)
let thePrice = price.toFixed(2)
//dividend in percent with two decimals (using full decimals for calculation)
let dividendPercent = (dividend/price * 100).toFixed(2)
//generate the HTML
const dataInsideDiv = `<div class="name"><p><span style="font-weight: normal">Price: </span>
${thePrice} $ </p><p><span style="font-weight: normal">Dividend: </span>
${theDividend} $ (${dividendPercent} %)</p></div>`
document.querySelector('.stock').innerHTML = dataInsideDiv;
 };
  } 