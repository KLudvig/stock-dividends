document.getElementById("clickMe").addEventListener("click", run);

//Async function to get stock info. Runs onClick.
async function run() {
  const getStock = document.getElementById('tickerSymbol').value;
  const [dividend, price] = await extractData(getStock);
  return createHTML([dividend, price]);
  run();
};

 //Reusable function for making api calls to Alpha Vantage
const apiCall = (ticker, func, compact) => {
  const key = 'API KEY';
  const urlData = { 
      url: 'https://www.alphavantage.co/query?function=',
      theFunction: func, 
      symbol: ticker, 
      apiKey: key, 
      outputsize: compact
  };
  const {url,theFunction,symbol,apiKey, outputsize} = urlData;
  const apiUrl = `${url}${theFunction}&symbol=${symbol}${outputsize}&apikey=${apiKey}`;
  return fetch(apiUrl);
};

//Function to extract the data
async function extractData(getStock) {
  
  const fetchPrice = apiCall(getStock, 'TIME_SERIES_DAILY', '&outputsize=compact');
  const fetchDividend = apiCall(getStock, 'TIME_SERIES_MONTHLY_ADJUSTED', '');
  const apiData = await Promise.all([fetchPrice, fetchDividend]);
  const priceFile = await apiData[0].json();
  const dividendFile = await apiData[1].json();

  //Get data from first API call
  const getPrice = new Promise(resolve => {
    const priceArray = Object.entries(priceFile['Time Series (Daily)']);
    const price = parseFloat(priceArray['0']['1']['4. close']);        
    resolve(price);
  });

  //Get data from second Api call
  const getDividend = new Promise(resolve => {
    const objArray = Object.entries(dividendFile['Monthly Adjusted Time Series']);
    const dividendArray = [];                                                     
    let i = 1;

    while(i<=12) {
    dividendArray.push(parseFloat(objArray[i]['1']["7. dividend amount"]))
    i++
    }
    let dividend = dividendArray.reduce((accumulator, currentValue) => {        
    return accumulator + currentValue;
    });

    resolve(dividend);
  });

  const [dividend, price] = await Promise.all([getDividend, getPrice]); 

  return [dividend, price];
};

const createHTML = ([dividend, price]) => {
  const theDividend = dividend.toFixed(2);
  const thePrice = price.toFixed(2);
  const dividendPercent = (dividend/price * 100).toFixed(2);
  
  //Generate the HTML
  const dataInsideDiv = `<div class="name"><p><span style="font-weight: normal">Price: </span>
  ${thePrice} $ </p><p><span style="font-weight: normal">Dividend: </span>
  ${theDividend} $ (${dividendPercent} %)</p></div>`;
  document.querySelector('.stock').innerHTML = dataInsideDiv;
};