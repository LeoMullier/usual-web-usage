chrome.browserAction.setBadgeText({text: 'off'});
chrome.browserAction.setBadgeBackgroundColor({color: 'white'}); 


let message_list = [];

function notify(message) {
 message_list.push(message);

  if (message.type == "save")
  {
	console.log("save")
    save();
  }
}

function save()
{
  var file = new Blob([JSON.stringify(message_list)], {type: 'application/json'});
  var file_url = URL.createObjectURL(file);

  chrome.downloads.download({ url : file_url, filename : 'navigation_data.json'});

  message_list = [];
}

/*
Assign `notify()` as a listener to messages from the content script.
*/
chrome.runtime.onMessage.addListener(notify);

