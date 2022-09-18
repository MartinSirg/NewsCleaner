console.log("Loaded bloat remover");

function getParentByTagName(element, tagName){
    if (element == null) {
        return null;
    }
    if (element.tagName === tagName) {
        return element;
    }
    if (element.parentNode == null) {
        return null;
    }
    return getParentByTagName(element.parentNode, tagName);
}

function getParentWithCssClass(element, cssClass){
    if (element == null) {
        return null;
    }
    if (element.classList.contains(cssClass)) {
        return element;
    }
    if (element.parentNode == null) {
        return null;
    }
    return getParentWithCssClass(element.parentNode, cssClass);
}


function getParentArticle(element) {
    const article = getParentByTagName(element, "ARTICLE");
    if (article?.parentNode?.hasAttribute("data-dropzone")) {
        return article.parentNode;
    }
    return article;
}

function getParentSection(element) {
    return getParentByTagName(element, "SECTION")
}

function getParentListItem(element){
    return getParentByTagName(element, "LI")
}

function getParentLatestArticle(el){
    return getParentWithCssClass(el, "C-headline-list__headline")
}

function deleteSisuturundus(){
    const allSections = document.querySelectorAll("section");
    //TODO: cache processed sections;

    const sisuturundusKeyword = "Sisuturundus";
    allSections.forEach(section => {
        if (section.innerHTML.includes(sisuturundusKeyword)){
            section.remove();
        }
    })

    const sisuturundusLink = document.querySelector("a[href='https://www.delfi.ee/news/sisuturundus/sisuturundus/']");
    const sisuturunudsSection = getParentSection(sisuturundusLink);
    if (sisuturunudsSection != null) {
        sisuturunudsSection.remove();
    }
}

function headlineViolatesCategory(excludedCategoryLinks, headlineNode){
    return excludedCategoryLinks.some(categoryLink => headlineNode.innerHTML.includes(categoryLink));
}

function headlineViolatesKeyword(excludedArticleKeywords, headlineNode){
    return excludedArticleKeywords.some(keyword => headlineNode.innerHTML.toLowerCase().includes(keyword.toLowerCase()))
}

function shouldRemoveArticle(excludedCategoryLinks, excludedArticleKeywords, headlineNode){
    if (headlineViolatesCategory(excludedCategoryLinks, headlineNode)){
        return true;
    }
    if (headlineViolatesKeyword(excludedArticleKeywords, headlineNode)) {
        return true;
    }
    return false;
}

function deleteExcludedArticles(excludedCategoryLinks, excludedArticleKeywords){
    const allHeadlines = document.querySelectorAll(".C-headline-title");
    //TODO: cache already processed headlines

    allHeadlines.forEach(headline => {
        if (shouldRemoveArticle(excludedCategoryLinks, excludedArticleKeywords, headline)){
            const article = getParentArticle(headline) ?? getParentListItem(headline);
            article?.remove();
        }
    })
}

function deleteExcludedCategorySections(excludedCategoryLinks){
    const sectionHeaders = document.querySelectorAll(".C-block-type-8__content");
    //TODO: cache already processed headers
    sectionHeaders.forEach(sectionHeader => {
        if (excludedCategoryLinks.some(categoryLink => sectionHeader.innerHTML.includes(categoryLink))) {
            getParentSection(sectionHeader)?.remove();
        }
    })
}

function deleteLatestSponsoredArticles(){
    const allSponsoredElements = document.querySelectorAll(".C-headline-icons__icon--sponsored-content");
    allSponsoredElements.forEach(el => {
        getParentLatestArticle(el)?.remove();
    })
}

function deleteLatestExcludedArticles(excludedCategoryLinks, excludedArticleKeywords){
    const allHeadlines = document.querySelectorAll(".C-headline-title");
    //TODO: cache already processed headlines

    allHeadlines.forEach(headline => {
        if (shouldRemoveArticle(excludedCategoryLinks, excludedArticleKeywords, headline)){
            let article = getParentLatestArticle(headline);
            if (article != null) {
                article.remove();
            }
        }
    })
}

function deleteAll(){
    chrome.storage.sync.get("newsCleanerConfig", ({newsCleanerConfig}) => {
        const excludedCategoryLinks = newsCleanerConfig.excludedCategories.filter(c => c.isExcluded).map(c => c.link);
        const excludedArticleKeywords = newsCleanerConfig.excludedArticleKeywords.filter(c => c.isExcluded).map(c => c.name);
        const isSponsoredContentExcluded = newsCleanerConfig.isSponsoredContentExcluded;

        if (document.URL === "https://www.delfi.ee/"){
            if (isSponsoredContentExcluded) {
                deleteSisuturundus();
            }
            if (excludedCategoryLinks.length > 0) {
                deleteExcludedCategorySections(excludedCategoryLinks);
            }
            if (excludedCategoryLinks.length > 0 || excludedArticleKeywords.length > 0) {
                deleteExcludedArticles(excludedCategoryLinks, excludedArticleKeywords);
            }
        }
        if (document.URL.startsWith("https://www.delfi.ee/viimased")) {
            if (isSponsoredContentExcluded){
                deleteLatestSponsoredArticles();
            }
            if (excludedCategoryLinks.length > 0 || excludedArticleKeywords.length > 0){
                deleteLatestExcludedArticles(excludedCategoryLinks, excludedArticleKeywords);
            }
        }
    });

}

function startDeleting() {
    console.log("Starting bloat deletion");
    deleteAll();
    document.addEventListener('DOMSubtreeModified', (e) => {
        deleteAll();
    })
}
setTimeout(() => startDeleting(), 1000);
