/*==============Redirect Search Query Logic Begins===============*/

chrome.webRequest.onBeforeRequest.addListener(
  //callback function
  function (details) {
    var appendString = "+in+2021";
    var targetURL = new URL(details.url);
    let myRedirect = targetURL; //initializing the redirect URL
    console.log("details.url was = " + targetURL);
    let queryTmp = targetURL.search; //temp variable to store the query
    const chars = queryTmp.split('&t='); //splitting and checking for partnership-token. See here : https://help.duckduckgo.com/privacy/t/
    queryTmp = chars[0];

    myRedirect = "https://" + targetURL.hostname + targetURL.pathname + queryTmp + appendString + targetURL.hash;

    /*==============Check the query for strings [2021] and [in 2021]. If found, there's no redirection required===============*/
    if (targetURL.search.includes("in 2021") || targetURL.search.includes("2021") || targetURL.search.includes("in") && targetURL.search.includes("2021")) {
      console.log("Redirect not initiated.");
      return;
    }
    else {
      console.log("'In 2021' NOT found in the query. Redirecting now...");
    }
    return { redirectUrl: myRedirect.toString() }; //the actual redirection
  },
  //filter begins
  { urls: ["https://duckduckgo.com/?q=*"] },
  //specify blocking
  ["blocking"]
);

