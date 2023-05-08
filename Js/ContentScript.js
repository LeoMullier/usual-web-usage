console.log("hhhhhhhhhhhhhhhhhhhh")
  chrome.Actions.setBadgeText({ tabId: myTabId, text: 'grr' });


/*
If the click was on a link, send a message to the background page.
The message contains the link's URL.
*/
function notifyExtension(e) {
  let target = e.target;
  while ((target.tagName != "A" || !target.href) && target.parentNode) {
    target = target.parentNode;
  }
  if (target.tagName != "A")
    return;

   //console.log("content script sending message");
   chrome.runtime.sendMessage({type: "click", url: target.href, timestamp: Date.now(), x: e.pageX, y: e.pageY});
}


function mouseEventHandler(e)
{
  chrome.runtime.sendMessage({type: "move", timestamp: Date.now(), x: e.pageX, y: e.pageY});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("click", notifyExtension);
window.addEventListener("mousemove", mouseEventHandler);
