//popup.js
function OpenURL() {
    //chrome.tabs.create({ url: "https://webapplis.utc.fr/ent/index.jsf" });
    chrome.runtime.sendMessage({type: "save"});
}
document.getElementById("openBtn").addEventListener("click", OpenURL);
