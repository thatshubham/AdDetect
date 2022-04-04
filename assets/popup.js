let msg = {
    txt: "Namaskar",
};

function changeCount(response) {
    console.log("No of Ads found = " + response);
    document.querySelectorAll("h1")[0].innerText = response; //h1 gets update with the ad count
}
//sends a message here
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, msg,
        function (response) {
            changeCount(response.response); //pass value to function at line-5
        });
});


