// Initialize button with user's preferred color
let excludedCategoriesContainer = document.getElementById("excluded-categories");
let excludedCategoriesForm = document.getElementById("excluded-categories__form");
let excludedKeywordsContainer = document.getElementById("excluded-keywords");
let excludedKeywordForm = document.getElementById("excluded-keywords__form");
let sponsoredContainer = document.getElementById("sponsored-content");

function getCategoryNodeId(category){
    return `category__${category.name}`;
}

function setCategoryExcluded(name, isExcluded){
    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.excludedCategories.forEach(c => {
            if (c.name === name) {
                c.isExcluded = isExcluded
            }
        })
        console.log("New config", newsCleanerConfig)
        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
    });
}

function deleteCategoryFromHtml(category){
    const node = document.getElementById(getCategoryNodeId(category));
    node?.remove();
}

function deleteCategory(category){
    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.excludedCategories =
            newsCleanerConfig.excludedCategories.filter(c => c.name !== category.name);

        console.log("New config", newsCleanerConfig)
        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
        deleteCategoryFromHtml(category);
    });
}

function getSingleCategoryExclusion(category) {
    const container = document.createElement("DIV");
    container.id = getCategoryNodeId(category)
    container.style.marginBottom = "0.5rem"

    const checkbox = document.createElement("INPUT");
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = category.isExcluded;
    checkbox.addEventListener('change', e => {
        if (checkbox.checked === true){
            setCategoryExcluded(category.name, true)
        } else {
            setCategoryExcluded(category.name, false)
        }
    })

    const span = document.createElement("SPAN")
    span.innerHTML = `<strong>${category.name}</strong>: ${category.link}`;
    span.style.marginLeft = "0.25rem"
    span.style.marginRight = "0.25rem"

    container.appendChild(checkbox)
    container.appendChild(span)

    if (!category.isDefault) {
        const deleteButton = document.createElement("A")
        deleteButton.innerHTML = "❌";
        deleteButton.addEventListener("click", () => deleteCategory(category))
        deleteButton.style.cursor = 'pointer';
        container.appendChild(deleteButton)
    }

    return container;
}

function addExcludedCategory(category) {
    const newNode = getSingleCategoryExclusion(category);
    excludedCategoriesContainer.insertBefore(newNode, excludedCategoriesForm);
}

function fillExcludedCategories(newsCleanerConfig) {
    newsCleanerConfig.excludedCategories.forEach(category => {
        addExcludedCategory(category);
    })
}

function getKeywordNodeId(keyword){
    return `keyword__${keyword.name}`;
}

function setKeywordExcluded(name, isExcluded){
    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.excludedArticleKeywords.forEach(c => {
            if (c.name === name) {
                c.isExcluded = isExcluded
            }
        })
        console.log("New config", newsCleanerConfig)
        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
    });
}

function toggleKeywordExcluded(checkbox, keyword){
    if (checkbox.checked === true){
        setKeywordExcluded(keyword.name, true)
    } else {
        setKeywordExcluded(keyword.name, false)
    }
}

function deleteKeywordFromHtml(keyword){
    const node = document.getElementById(getKeywordNodeId(keyword));
    node?.remove();
}

function deleteKeyword(keyword){
    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.excludedArticleKeywords =
            newsCleanerConfig.excludedArticleKeywords.filter(kw => kw.name !== keyword.name);

        console.log("New config", newsCleanerConfig)
        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
        deleteKeywordFromHtml(keyword);
    });
}

function getSingleKeywordExclusion(keyword){
    const container = document.createElement("DIV");
    container.id = getKeywordNodeId(keyword)
    container.style.marginBottom = "0.5rem"

    const checkbox = document.createElement("INPUT");
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = keyword.isExcluded;
    checkbox.addEventListener('change', () => toggleKeywordExcluded(checkbox, keyword))

    const span = document.createElement("SPAN")
    span.innerHTML = `<strong>${keyword.name}</strong>`;
    span.style.marginLeft = "0.25rem"
    span.style.marginRight = "0.25rem"

    container.appendChild(checkbox)
    container.appendChild(span)

    if (!keyword.isDefault) {
        const deleteButton = document.createElement("A")
        deleteButton.innerHTML = "❌";
        deleteButton.addEventListener("click", () => deleteKeyword(keyword))
        deleteButton.style.cursor = 'pointer';
        container.appendChild(deleteButton)
    }

    return container;
}

function addExcludedKeyword(keyword){
    const exclusionNode = getSingleKeywordExclusion(keyword);
    excludedKeywordsContainer.insertBefore(exclusionNode, excludedKeywordForm);
}

function fillExcludedKeywords(newsCleanerConfig) {
    newsCleanerConfig.excludedArticleKeywords.forEach(keyword => {
        addExcludedKeyword(keyword)
    })
}

function toggleSponsoredContentExcluded(checkbox){
    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        newsCleanerConfig.isSponsoredContentExcluded = checkbox.checked;
        console.log("New config", newsCleanerConfig)
        chrome.storage.sync.set({"newsCleanerConfig": newsCleanerConfig});
    });
}


function fillSponsoredContent(newsCleanerConfig) {
    const container = document.createElement("DIV");
    const checkbox = document.createElement("INPUT");
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked =  newsCleanerConfig.isSponsoredContentExcluded;
    checkbox.addEventListener('change', () => toggleSponsoredContentExcluded(checkbox))

    const span = document.createElement("SPAN")
    span.innerHTML = `<strong>Keela sisuturundus</strong>`;

    container.appendChild(checkbox)
    container.appendChild(span)

    sponsoredContainer.appendChild(container)
}

chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
    fillExcludedCategories(newsCleanerConfig);
    fillExcludedKeywords(newsCleanerConfig);
    fillSponsoredContent(newsCleanerConfig);
});
