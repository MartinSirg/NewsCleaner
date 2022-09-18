// background.js
const defaultConfig = {
    excludedCategories: [
        {
            name: "sport",
            link: "https://sport.delfi.ee",
            isExcluded: true,
            isDefault: true
        },
        {
            name: "piletid",
            link: "https://www.piletitasku.ee",
            isExcluded: true,
            isDefault: true
        },
        {
            name: "podcastid",
            link: "https://tasku.delfi.ee",
            isExcluded: true,
            isDefault: true
        },
    ],
    excludedArticleKeywords: [
        {
            name: "horoskoop",
            isExcluded: true,
            isDefault: true
        }
    ],
    isSponsoredContentExcluded: true
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({"newsCleanerConfig": defaultConfig});
    console.log('Default config set to', defaultConfig);
});