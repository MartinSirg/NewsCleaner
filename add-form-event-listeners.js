const categoryNameInput = document.getElementById("add-category-name");
const categoryLinkInput = document.getElementById("add-category-link");
const categorySubmit = document.getElementById("add-category-button");
const categoryValidationErrors = document.getElementById("excluded-categories__form-validation-message");

const keywordNameInput = document.getElementById("add-keyword-name");
const keywordSubmit = document.getElementById("add-keyword-button");
const keywordValidationErrors = document.getElementById("excluded-keywords__form-validation-message");

const refreshButton = document.getElementById("refresh-button")

const invalidCategoryNameId = "#invalid-category-name";
const invalidCategoryLinkId = "#invalid-category-link";
const invalidKeywordName = "#invalid-keyword-name";

const validationMessageMap = new Map()
validationMessageMap.set(invalidCategoryNameId, "Kategooria nimi on juba olemas");
validationMessageMap.set(invalidCategoryLinkId, "Kategooria link on juba olemas");
validationMessageMap.set(invalidKeywordName, "Märksõna on juba olemas");

function getValidationMessageNode(messageId){
    return document.getElementById(messageId);
}

function disableButton(button) {
    button.setAttribute("disabled", "disabled");
}

function enableIfNoValidationErrors(button, validationErrorsContainer) {
    if (validationErrorsContainer.children.length === 0) {
        button.removeAttribute("disabled");
    }
}

function addValidationMessage(messageId, validationMessagesContainer){
    if (getValidationMessageNode(messageId) == null) {
        const message = document.createElement("DIV");
        message.id = messageId;
        message.innerText = validationMessageMap.get(messageId);
        validationMessagesContainer.appendChild(message);
    }
}

function removeValidationMessage(messageId){
    getValidationMessageNode(messageId)?.remove();
}

categoryNameInput.addEventListener("input", (e) => {
    const newValue = e.target.value;

    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        if (newsCleanerConfig.excludedCategories.some(c => c.name === newValue)){
            addValidationMessage(invalidCategoryNameId, categoryValidationErrors);
            disableButton(categorySubmit);
        } else {
           removeValidationMessage(invalidCategoryNameId);
           enableIfNoValidationErrors(categorySubmit, categoryValidationErrors);
        }
    });
})

categoryLinkInput.addEventListener("input", (e) => {
    const newValue = e.target.value;

    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        if (newsCleanerConfig.excludedCategories.some(c => c.link === newValue)){
            addValidationMessage(invalidCategoryLinkId, categoryValidationErrors);
            disableButton(categorySubmit)
        } else {
            removeValidationMessage(invalidCategoryLinkId);
            enableIfNoValidationErrors(categorySubmit, categoryValidationErrors);
        }
    });
})

keywordNameInput.addEventListener("input", (e) => {
    const newValue = e.target.value;

    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        if (newsCleanerConfig.excludedArticleKeywords.some(kw => kw.name === newValue)){
            addValidationMessage(invalidKeywordName, keywordValidationErrors);
            disableButton(keywordSubmit)
        } else {
            removeValidationMessage(invalidKeywordName);
            enableIfNoValidationErrors(keywordSubmit, keywordValidationErrors);
        }
    });
})


keywordSubmit.addEventListener("click", () => {
    if (!keywordNameInput.value) {
        console.log("Keyword empty");
        return;
    }

    const newExcludedKeyword = {
        name: keywordNameInput.value,
        isExcluded: true
    }

    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.excludedArticleKeywords.push(newExcludedKeyword);

        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
        addExcludedKeyword(newExcludedKeyword);
        keywordNameInput.value = "";
    });
})

categorySubmit.addEventListener("click", () => {
    if (!categoryLinkInput.value || !categoryNameInput.value) {
        console.log("One or more inputs empty");
        return;
    }

    const newExcludedCategory = {
        name: categoryNameInput.value,
        link: categoryLinkInput.value,
        isExcluded: true
    }

    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.excludedCategories.push(newExcludedCategory);

        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
        addExcludedCategory(newExcludedCategory);
        categoryNameInput.value = "";
        categoryLinkInput.value = "";
    });
})

// When the button is clicked, inject setPageBackgroundColor into current page
refreshButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: reloadPage,
    });
});

// The body of this function will be executed as a content script inside the
// current page
function reloadPage() {
    document.location.reload();
}