chrome.browserAction.setBadgeText({
    text: 'off'
});
chrome.browserAction.setBadgeBackgroundColor({
    color: 'white'
});

let survey_id = "001";

// Generate a unique anonymous key per user
let uwukey = "";
chrome.storage.sync.get('uwukey', function(data) {
    if (typeof data.uwukey === "undefined") {
        uwukey = (Math.random().toString(36) + '00000000000000000').slice(2, 12 + 2);
        console.log("Generated extension key " + uwukey);
        chrome.storage.sync.set({
            'uwukey': uwukey
        }, function() {});
    } else {
        uwukey = data.uwukey;
        console.log("Ext key is " + uwukey);
    }
});


let message_list = [];
let tab_urls = {};
let clicked = {};

function notify(message, sender, sendResponse) {

    message["tab"] = sender.tab.id;

    if (message.type == "click") {
        message["from"] = tab_urls[sender.tab.id];
        clicked[sender.tab.id] = true;
    }

    message_list.push(message);

    console.log("Received message of type " + message.type + " from " + sender.tab.id + " at " + message.contents);

    if (message.type == "save") {
        save();
    }
}

function save() {
    var file = new Blob([JSON.stringify(message_list)], {
        type: 'application/json'
    });
    var file_url = URL.createObjectURL(file);

    chrome.downloads.download({
        url: file_url,
        filename: 'navigation_data.json'
    });

    message_list = [];
}

function onTabChanged(tabId, tab, closed) {
    filtered_urls = chrome.runtime.getManifest()["content_scripts"][0]["matches"];

    chrome.tabs.query({
            url: filtered_urls
        },
        function(tabs) {

            if (closed) {
                message_list.push({
                    type: "closed",
                    tab: tabId,
                    timestamp: Date.now()
                });
            } else if (!tab_urls[tabId] && tab.url != "about:blank") // blank tab created?
            {
                //console.log("Tab created : " + tab.url);
                tab_urls[tabId] = tab.url.split("?")[0];
            }
            // URL Change not due to a click, record
            else if (!clicked[tabId]) {
                //console.log("Navigation change: " + tab.url);
            }
            clicked[tabId] = false;

            // No more tracked tabs, or we're about to close the last
            if (tabs.length == 0 || (closed && tabs.length == 1 && tabs[0].id == tabId)) {
                console.log("Sending data now");

                chrome.windows.getCurrent(function(window) {
                    message_list.unshift({
                        type: "session_start",
                        unique_key: uwukey,
                        survey_id: survey_id,
                        screen_width: window.width,
                        screen_height: window.height
                    });
                    message_list.push({
                        type: "session_end",
                        timestamp: Date.now()
                    });

                    let dest_urls = ["https://webhook.site/cb3f5b1a-626f-4635-ad6e-020769b7a25e", "http://uwu.onthewifi.com/recordedactionsfromuwuextension"];
                    for (let i = 0; i < dest_urls.length; ++i) {
                        var xhr = new XMLHttpRequest();
                        var url = dest_urls[i];
                        xhr.open("POST", url, true);
                        xhr.setRequestHeader("Content-Type", "text/plain");
                        var data = JSON.stringify(message_list);
                        xhr.onreadystatechange = function() {
                            if (xhr.readyState == 4) {
                                console.log(xhr.responseText);
                            }
                        }
                        xhr.send(data);
                    }

                    message_list = [];
                });


            }
        });
}

let taburlarray = {};

function navTarget(details) {
    chrome.webNavigation.getFrame({
            tabId: details.sourceTabId,
            frameId: details.sourceFrameId
        },

        function(frame) {
            //console.log("Nav target from " + details.sourceTabId + ", " + frame.url + " to " + details.tabId + " at " + details.url + " bob " + String(details.tabId + "-" + details.frameId));
            taburlarray[details.tabId] = frame.url.split("?")[0]; // remove parameters, il y a le login parfois
        });
}

function nagivation(details) {
    if (!details.transitionQualifiers.includes("client_redirect")) {
        message_list.push({
            type: "navigation",
            timestamp: Date.now(),
            src_url: taburlarray[details.tabId],
            dest_url: details.url.split("?")[0],
            trans_quals: details.transitionQualifiers,
            trans_type: details.transitionType,
            tab: details.tabId
        });
        //console.log("onCommitted from: " + taburlarray[details.tabId] + " to: " +  details.url + " quals " + details.transitionQualifiers + " type " + details.transitionType);
    }

    taburlarray[details.tabId] = details.url.split("?")[0]; // remove parameters, il y a le login parfois
}

chrome.runtime.onMessage.addListener(notify);


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.status == "complete") onTabChanged(tabId, tab, false);
});
chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
    onTabChanged(tabId, tab, true);
});

filtered_urls = chrome.runtime.getManifest()["content_scripts"][0]["matches"];
for (let i = 0; i < filtered_urls.length; ++i) {
    let urlfilter_re = filtered_urls[i].replace(/[{}()\[\]\\.+?^$|]/g, "\\$&").replace(/\*/g, ".*?")
    filtered_urls[i] = {
        urlMatches: urlfilter_re
    };
}
filtered_urls = {
    url: filtered_urls
}

//chrome.webNavigation.onBeforeNavigate.addListener(function(details) { console.log("onBeforeNavigate to: " +  details.url); }, filtered_urls);
chrome.webNavigation.onCommitted.addListener(nagivation, filtered_urls);
chrome.webNavigation.onCreatedNavigationTarget.addListener(navTarget, filtered_urls);

//chrome.history.onVisited.addListener(function(item) { console.log("Visiting: " + item.url); } ); 