# Ad Detect

## Table of Contents

- [About](#about)
- [Features](#features)
- [How to Install the Extension](#installation)
  - [Google Chrome](#google-chrome)
  - [Mozilla Firefox](#mozilla-firefox)
- [Software Design and Implementation](#software-design-and-implementation)
  - [Basic File Structure](#basic-structure-of-the-files)
  - [Logic](#implementation-of-logic)
  - [Testing](#testing)
  - [Problems and Solutions](#problems-faced-and-resolved)
- [Decisions and Tradeoffs](#decisions-and-tradeoffs)
  - [Manifest Version 3](#manifest-version-3)
  - [Options Page](#options-page)

## About

It's not easy identifying if a search-engine result is organic or an advert, especially if you're in a hurry. To help users, this browser extension identifies
adverts on [duckduckgo](https://duckduckgo.com/) and highlights them.

## Features

- Change the background of ads to the color red.
- Append `"in 2021"` to the search queries.
- Display the number of ads of the open search tab in the extension popup.

## Installation

### Google Chrome

#### <ins>Step 1<ins>

1. Download the ZIP file by [**clicking here**](https://github.com/thatshubham/AdDetect/archive/refs/heads/main.zip).
2. Extract the contents of the folder using 7-zip or a built-in tool on your computer.

> OR fork the `main` branch into your personal repository. Clone it to local computer.
>
> ```sh
> $ git clone https://github.com/thatshubham/AdDetect.git
> ```

#### <ins>Step 2<ins>

1. Type `chrome://extensions` into the URL bar and hit enter..
2. Ensure that the <ins>Developer mode</ins> checkbox in the top right-hand corner is checked.
3. Click on <ins>Load unpacked</ins>.
4. Navigate to the folder where you just extracted the files and select it.
5. The extension should be loaded now.

### Mozilla Firefox

#### <ins>Step 1<ins>

1. Download the ZIP file by [**clicking here**](https://github.com/thatshubham/AdDetect/archive/refs/heads/firefox.zip).
2. Extract the contents of the folder using a program like 7-zip or a built-in tool on your computer.

> or fork `firefox` branch into your personal repository. Clone it to local computer.

#### <ins>Step 2<ins>

1. Type `about:debugging#/runtime/this-firefox` in the URL bar and hit enter.
2. Click on <ins>Load Temporary Add-on...</ins> button.
3. Navigate to the folder where you just extracted the files and select the <ins>manifest.json</ins> file.
4. The extension should be loaded now.

---

### Software Design and Implementation

#### Basic Structure of the files

1. The manifest file contains the links to all the extension assets and permissions.
2. The images (icon files) and content scripts are inside subdirectories of their own to maintain a consistent hierarchy.
3. The background script is at the root directory.

#### Implementation of logic

**Primary Task**  
The primary task of the extension is to detect ads, count the ads and redirect queries.

**Behind the scenes**  
Capturing the ads is done by manipulating the DOM. On inspecting the HTML of the rendered page of duckduckgo, it becomes clear that all
ads are nested within divs with certain classnames and ids. These are different for the `main` container and `sidebar`.

**Approaching the problem**  
DOM manipulation is done with `content_scripts`. Different variables are assigned to capture `nodes` that match the specific classnames. These nodes are then
  iterated through and a custom classname `red` is appended to them.

Since the problem requires counting the number of ads, we also have dedicated variables that keep tab on the number of ads. This is done by counting the
  number of children elements of targeted nodes.

The next task is redirecting queries. This is accomplished with a simple background script. The best time to do this is intercept the request before it is about to be made, and before headers are available.
  - This is done with webRequest's `onBeforeRequest` with a listener added to it.
  - It contains a callback `function`, a `filter` and a `blocking` parameter.
  - The callback function is where the redirection logic is present.
  - A variable `targetURL` stores the URL of the page about to be requested. Another variable `queryTmp` stores the query parameter inside the URL object.
  - Before appending the text `in 2021`, we need to check if the query string already contains it. Simple enough, this is achieved with a `if-else` loop.
  - Once the condition is satisfied the redirection happens.
> As a redundancy measure, I also make sure to sanitize the query string from partnership-token that look like `&t=`.


#### Testing

Testing for the extension is done with a tool by Mozilla called [web-ext](https://github.com/mozilla/web-ext). Among other things, it has a `lint` feature
which reports errors in the extension manifest or other source code files.

#### Problems faced (and resolved)

1. **The ad count has to be updated dynamically** : To make sure the ads are highlighted as soon as the page is loaded and the ad count is accurate, the
   function needs to be called after every AJAX request. This problem was solved by the following approaches :

   - Since the readystatechange event is fired whenever the readyState property of the XMLHttpRequest changes, we make sure the initial function load happens
     when this is `interactive`.
   - To make sure the function is dynamically called, the actual logic is enclosed within a function listening to fetch calls -->
     `redirecter()`. 
   - `redirecter()` uses a performance observer API to monitor `initiatorType` of AJAX requests. Only and only when a call is made to the duck
     server is the main-logic function loaded. This ensures better performance as opposed to setting a timer function or adding a click based listener.

2. **The pop-up needs the data from content_script** : Since the content script is essentially sand-boxed within the scope of the webpage, it is not easy to
   communicate with other parts of the extension. Web browsers have an easy to use messaging API `onMessage` and `sendMessage`.
   - We initiate a message channel from our `popup` when it is opened.
   - The message goes to the content script which replies with ad count variable's value.
   - On receiving the value, a function is fired which targets the `h1` of our `popup.html` and replaces the placeholder with the actual value.

## Decisions and tradeoffs

#### Manifest Version 3

**What?**

Initially, the plan was to design two separate extensions for chrome and firefox. The one for chrome using
[Manifest Version 3](https://developer.chrome.com/docs/extensions/mv3/intro/) and the latter using MV2. This was almost accomplished except the query replacing
part.

**How**

- The targeting of ads, counting of ads and messaging was the same logic as above.
- The query replacing part is different owing to Service workers replacing background pages.
- Network request modification is now handled with the new `declarativeNetRequest` API.
- The `declarativeNetRequest` API has a single declarative Rule feature which was used in the initial stages of development. The remnants of which can be found
  in the `discarded` subdirectory.

**Why not?**

I tried this approach with a Ruleset giving it a `QueryTransform` function. It worked fine except this API _replaces_ the query with the new one and doesn't
_append_ it. After a lot of debugging and lack of concrete examples in the chrome developers page, I went old school with MV2.

**Future**

Would love to implement this feature, given a little more time on my hands and a chance to play around with the brand-new API.

#### Options Page

**What can be added?**

An optional `settings` page can also be easily implemented in the future. Users can be given an option to append a _custom_ query instead of the `in 2021`
that's hard-coded here. Another option can be a custom color instead of `red`. This would also involve using the `storage API` to store the color and query
variables and retrieve them on the next visit. We can also store the total ad count in a global variable to display the _total_ ads highlighted across a span of
days/weeks/months in the popup.

## Footnotes

The chrome version should ideally work on Brave, Opera and Vivaldi | [Chrome Developers Page](https://developer.chrome.com/docs/extensions/mv3/faq/#faq-dev-01)
