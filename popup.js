//popup.js
function OpenURL() {
    chrome.tabs.create({ url: "https://webapplis.utc.fr/ent/index.jsf" });
}
document.getElementById("openBtn").addEventListener("click", OpenURL);