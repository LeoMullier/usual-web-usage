//console.log("Spawned frame " + chrome.runtime.getFrameId(window) + " with title " + document.title);
chrome.runtime.sendMessage({type: "dom_load", title: document.title});


/*
If the click was on a link, send a message to the background page.
The message contains the link's URL.
*/
function notifyExtension(e) {
    console.log("click")
  let target = e.target;
  while (!(target.tagName == "A" /*&& target.href*/) && target.parentNode) {
    target = target.parentNode;
  }
  if (target.tagName != "A")
    return;

   //console.log("content script sending message");
  console.log("Size : " + window.screen.width + ", " + window.screen.height);
   chrome.runtime.sendMessage({type: "click", from: window.location.href, url: target.href.split("?")[0], possible_title: e.target.innerHTML, contents: target.outerHTML, timestamp: Date.now(), x: e.pageX, y: e.pageY,
        width: window.screen.width, height: window.screen.height});
}


function mouseEventHandler(e)
{
  chrome.runtime.sendMessage({type: "move", timestamp: Date.now(), x: e.pageX, y: e.pageY});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("mousedown", notifyExtension);
//document.addEventListener("click", notifyExtension);
//window.addEventListener("mousemove", mouseEventHandler);
window.unload = function(e) {
  chrome.runtime.sendMessage({type: "closed", url: window.location.href});
};