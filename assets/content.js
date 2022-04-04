document.onreadystatechange = function () {
  // console.log(document.readyState); 
  if (document.readyState === "interactive") redirecter(); //start the fetch monitoring function as soon as the page goes intereactive
  if (document.readyState === "complete") {
    highlighter(); //redundancy measure forloading function in chromium
  }
};

document.addEventListener("DOMContentLoaded", () => {
  redirecter(); //redundancy measure forloading function in firefox
});

//global variable declarations
let dataTestIDint = 0;
let carouselAdsint = 0;
let sum = 0;


function highlighter() {
  let target0 = document.querySelectorAll("#ads")[0]; //targeting advert elements in the next 3 lines
  let target1 = document.querySelectorAll(".result--ad");
  let target2 = document.querySelectorAll(".module--carousel-products");

  if (target0.childElementCount > 0) {
    target0.classList.add("red");
  }

  if (target1.length > 0) {
    for (let i = 0; i < target1.length; i++) {
      target1[i].classList.add("red"); //iterate through the number of elements and append the custom class name
    }
    let dataTestID = document.querySelectorAll(`[data-testid="ad"]`);
    dataTestIDint = dataTestID.length; //variable counts no. of ads in the main-container 
  }
  if (target2.length > 0) {
    for (let i = 0; i < target2.length; i++) {
      target2[i].classList.add("red");
    }
    let carouselAds = document.querySelectorAll(".module--carousel__items")[0];
    carouselAdsint = carouselAds.childElementCount; //variable counts no. of ads in the sidebar module
  }
  sum = dataTestIDint + carouselAdsint; // variable stores the total ad-count
  //console.log("Total Ads Served = " + sum);
}

function redirecter() {
  /* This function monitors all fetch calls and pixel-loading from duckduckgo's domain to facilitate re-firing the ad-counting function */
  function fetchFunction() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === "fetch" || entry.initiatorType == "img") {
          highlighter(); //this is called when a fetch call is made or an img gets loaded
        }
      }
    });
    observer.observe({ entryTypes: ["resource"] });
    fetch("duckduckgo.com")
      .then((res) => res.text())
      .then((text) => console.log("fetch called"));
  }
  fetchFunction();
}

chrome.runtime.onMessage.addListener(gotMessage); //to be used with chromium-based browsers
// browser.runtime.onMessage.addListener(gotMessage); //to be used with firefox

/*message passing function - responds with the ad count*/
function gotMessage(message, sender, sendResponse) {
  console.log(message.txt);
  sendResponse({ response: sum });
}
