const imageArray = ["img2.jpg", "img1.jpg", "img0.jpg", "img3.jpg", "img4.jpg", "img11.jpg", "img12.jpg", "img13.jpg", "img14.jpg", "img15.jpg", "img16.jpg"];

const imageSlider = document.getElementById("carousel");
let imageIndex = 0;

const SUPERHERO = {
    apiKey: "9cad86f4340a7a8860ae1bb68ebce024"
};

const STARTER_HERO_IDS = ["106", "620", "346"];

const COMIC_VINE = {
    apiKey: "bdc95979da4e2d7c44f43f24a49b6b2a7d556e4b",
    baseUrl: "https://comicvine.gamespot.com/api"
};

const DEMO_CHARACTERS = [
    { name: "Black Panther", id: 1009187, image: "img4.jpg" },
    { name: "Spider-Man", id: 1009610, image: "img0.jpg" },
    { name: "Iron Man", id: 1009368, image: "img1.jpg" }
];

const DEMO_COMICS = [
    { title: "The Amazing Spider-Man (2018) #56", id: "1189468", issueNumber: "56", series: "The Amazing Spider-Man (2018)", image: "comicss.jpg" },
    { title: "Captain America (2018) #1", id: "402060", issueNumber: "1", series: "Captain America (2018)", image: "img10.jpg" },
    { title: "Guardians of the Galaxy (2020) #1", id: "502862", issueNumber: "1", series: "Guardians of the Galaxy (2020)", image: "img6.jpg" }
];

function hasValidSuperheroConfig() {
    return !!SUPERHERO.apiKey && !SUPERHERO.apiKey.includes("YOUR_");
}

function getSuperheroResults(data) {
    if (!data || data.response !== "success") return [];

    if (Array.isArray(data.results)) {
        return data.results;
    }

    if (data.id) {
        return [data];
    }

    return [];
}

function isMarvelHero(hero) {
    return hero?.biography?.publisher?.toLowerCase().includes("marvel");
}

function isMarvelIssue(issue) {
    const publisher = issue?.volume?.publisher?.name;
    return !publisher || publisher.toLowerCase().includes("marvel");
}

function superheroSearch(query) {
    const cleanedQuery = query.trim();
    const queries = [cleanedQuery];

    if (cleanedQuery.includes("-")) queries.push(cleanedQuery.replace(/-/g, " "));
    if (cleanedQuery.includes(" ")) queries.push(cleanedQuery.replace(/\s+/g, ""));

    return queries.reduce((request, currentQuery) => request.catch(() => {
        const url = `https://www.superheroapi.com/api.php/${SUPERHERO.apiKey}/search/${encodeURIComponent(currentQuery)}`;
        return fetch(url).then((response) => {
            if (!response.ok) throw new Error(response.statusText || "Superhero API request failed.");
            return response.json();
        }).then((data) => {
            if (data?.response === "error") throw new Error(data.error || "No results found.");
            return data;
        });
    }), Promise.reject(new Error("No results found.")));
}

function comicVineRequest(path, params) {
    const callbackName = `comicVineCallback${Date.now()}${Math.random().toString(36).slice(2)}`;
    const query = new URLSearchParams({
        api_key: COMIC_VINE.apiKey,
        format: "jsonp",
        json_callback: callbackName,
        ...params
    });

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const cleanup = () => {
            delete window[callbackName];
            script.remove();
        };

        window[callbackName] = (data) => {
            cleanup();
            if (data.status_code !== 1) {
                reject(new Error(data.error || "Comic Vine API request failed."));
                return;
            }
            resolve(data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error("Comic Vine API request failed."));
        };
        script.src = `${COMIC_VINE.baseUrl}${path}?${query.toString()}`;
        document.head.appendChild(script);
    });
}

function setWarning(id, message) {
    const warning = document.getElementById(id);
    if (warning) warning.innerText = message;
}

function sliding() {
    if (imageSlider) {
        imageSlider.style.backgroundImage = `url(${imageArray[imageIndex]})`;
        imageIndex = (imageIndex + 1) % imageArray.length;
    }
    setTimeout(sliding, 10000);
}
window.addEventListener("load", sliding);

const CharacterName = document.getElementById("character");
const SearchCharacter = document.getElementById("SearchCharacter");
const charactersContainer = document.getElementById("charcters");
const ComicName = document.getElementById("Comic-title-input");
const SearchComicByTitle = document.getElementById("SearchComicByTitle");
const ComicByID = document.getElementById("Comic-id-input");
const SearchComicByID = document.getElementById("SearchComicByID");
const ComicContainer = document.getElementsByClassName("comics")[0];
const upcInput = document.getElementById("UPC-input");
const isbnInput = document.getElementById("ISBN-input");
const SearchComicByUPC = document.getElementById("SearchComicByUPC");
const SearchComicByISBN = document.getElementById("SearchComicByISBN");
const descriptionContainer = document.getElementsByClassName("description")[0];

function displayCharacters(data) {
    const results = getSuperheroResults(data).filter(isMarvelHero);

    if (!results.length) {
        displayFallbackCharacters();
        return;
    }

    CharacterName.value = "";
    removePreviousCharacter();

    for (let i = 0; i < results.length; i++) {
        const hero = results[i];
        if (!hero || !hero.name) continue;

        const characterBox = document.createElement("div");
        const imgDiv = document.createElement("div");
        const detailsDiv = document.createElement("div");
        const name = document.createElement("p");
        const id = document.createElement("p");

        imgDiv.className = "img-0";
        characterBox.className = "character";
        detailsDiv.className = "details";

        name.innerText = hero.name;
        id.innerText = "ID: " + hero.id;
        imgDiv.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${hero.image?.url || "https://via.placeholder.com/500x750?text=No+Image"})`;

        detailsDiv.appendChild(name);
        detailsDiv.appendChild(id);
        characterBox.appendChild(imgDiv);
        characterBox.appendChild(detailsDiv);
        charactersContainer.appendChild(characterBox);
    }
}

function displayFallbackCharacters() {
    removePreviousCharacter();
    DEMO_CHARACTERS.forEach((hero) => {
        const characterBox = document.createElement("div");
        const imgDiv = document.createElement("div");
        const detailsDiv = document.createElement("div");
        const name = document.createElement("p");
        const id = document.createElement("p");

        imgDiv.className = "img-0";
        characterBox.className = "character";
        detailsDiv.className = "details";

        name.innerText = hero.name;
        id.innerText = "ID: " + hero.id;
        imgDiv.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${hero.image})`;

        detailsDiv.appendChild(name);
        detailsDiv.appendChild(id);
        characterBox.appendChild(imgDiv);
        characterBox.appendChild(detailsDiv);
        charactersContainer.appendChild(characterBox);
    });
}

function removePreviousCharacter() {
    if (charactersContainer) charactersContainer.innerHTML = "";
}

function loadCharacterByName() {
    removePreviousCharacter();

    if (!hasValidSuperheroConfig()) {
        displayFallbackCharacters();
        setWarning("Warning1", "Demo mode active: add your Superhero API token in the script to enable live results.");
        return;
    }

    superheroSearch(CharacterName.value)
        .then((data) => displayCharacters(data))
        .catch((err) => {
            console.error(err);
            setWarning("Warning1", "No character found. Try a full name, such as Iron Man or Spider-Man.");
            removePreviousCharacter();
        });
}

function loadStarterCharacters() {
    if (!hasValidSuperheroConfig()) {
        displayFallbackCharacters();
        return;
    }

    Promise.all(STARTER_HERO_IDS.map((id) => fetch(
        `https://www.superheroapi.com/api.php/${SUPERHERO.apiKey}/${id}`
    ).then((response) => {
        if (!response.ok) throw new Error("Unable to load starter character.");
        return response.json();
    })))
        .then((heroes) => {
            const results = heroes.filter((hero) => hero?.response === "success");
            if (!results.length) throw new Error("No starter characters found.");

            displayCharacters({ response: "success", results });
        })
        .catch((err) => {
            console.error(err);
            displayFallbackCharacters();
        });
}

CharacterName.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        if (!CharacterName.value.trim()) {
            setWarning("Warning1", "*Please Enter the Character Name");
        } else {
            setWarning("Warning1", "");
            loadCharacterByName();
        }
    }
});

SearchCharacter.addEventListener("click", function () {
    if (!CharacterName.value.trim()) {
        setWarning("Warning1", "*Please Enter the Character Name");
    } else {
        setWarning("Warning1", "");
        loadCharacterByName();
    }
});

function displayFallbackComics() {
    removePreviousComics();
    DEMO_COMICS.forEach((comic) => {
        const comicBox = document.createElement("div");
        const comicImg = document.createElement("div");
        const detailsDiv = document.createElement("div");
        const title = document.createElement("p");
        const isbn = document.createElement("p");
        const upc = document.createElement("p");
        const series = document.createElement("p");

        comicBox.className = "comic";
        comicImg.className = "img-0";
        detailsDiv.className = "details";

        title.innerText = comic.title;
        upc.innerText = `ID: ${comic.id}`;
        isbn.innerText = `Issue: #${comic.issueNumber}`;
        series.innerText = `Series: ${comic.series}`;
        comicImg.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${comic.image})`;

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(upc);
        detailsDiv.appendChild(isbn);
        detailsDiv.appendChild(series);
        comicBox.appendChild(comicImg);
        comicBox.appendChild(detailsDiv);
        ComicContainer.appendChild(comicBox);
    });
}

function removePreviousComics() {
    if (ComicContainer) ComicContainer.innerHTML = "";
}

function displayComicVineIssues(issues) {
    removePreviousComics();

    if (!issues.length) {
        displayFallbackComics();
        return;
    }

    issues.forEach((issue) => {
        const comicBox = document.createElement("div");
        const comicImg = document.createElement("div");
        const detailsDiv = document.createElement("div");
        const title = document.createElement("p");
        const comicId = document.createElement("p");
        const issueNumber = document.createElement("p");
        const volume = document.createElement("p");

        comicBox.className = "comic";
        comicImg.className = "img-0";
        detailsDiv.className = "details";
        title.innerText = issue.name || `${issue.volume?.name || "Untitled issue"}${issue.issue_number ? ` #${issue.issue_number}` : ""}`;
        comicId.innerText = `ID: ${issue.id || "Not Available"}`;
        issueNumber.innerText = issue.issue_number ? `Issue: #${issue.issue_number}` : "Issue: Not Available";
        volume.innerText = issue.volume?.name ? `Series: ${issue.volume.name}` : "Series: Not Available";
        comicImg.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${issue.image?.original_url || issue.image?.super_url || "https://via.placeholder.com/500x750?text=No+Cover"})`;

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(comicId);
        detailsDiv.appendChild(issueNumber);
        detailsDiv.appendChild(volume);
        comicBox.appendChild(comicImg);
        comicBox.appendChild(detailsDiv);
        ComicContainer.appendChild(comicBox);
    });
}

function loadComicVineIssuesForHero(hero) {
    return comicVineRequest("/search/", {
        query: hero.name,
        resources: "character",
        limit: "1"
    })
        .then((searchData) => {
            const character = searchData.results?.[0];
            if (!character?.id) throw new Error("Character was not found in Comic Vine.");

            return comicVineRequest(`/character/4005-${character.id}/`, {
                field_list: "issue_credits"
            });
        })
        .then((characterData) => {
            const credits = characterData.results?.issue_credits || [];
            return Promise.all(credits.slice(0, 12).map((credit) => {
                const issueId = credit.api_detail_url?.match(/4000-(\d+)/)?.[1] || credit.id;
                if (!issueId) return null;

                return comicVineRequest(`/issue/4000-${issueId}/`, {
                    field_list: "id,name,issue_number,image,volume"
                }).then((issueData) => issueData.results);
            })).then((issues) => issues.filter(isMarvelIssue));
        })
        .then((issues) => issues.filter(Boolean));
}

function loadComicVineIssuesByTitle(title) {
    return comicVineRequest("/search/", {
        query: title.trim(),
        resources: "issue",
        limit: "12",
        field_list: "id,name,issue_number,image,volume"
    }).then((searchData) => Promise.all((searchData.results || []).map((issue) => {
        const issueId = issue.api_detail_url?.match(/4000-(\d+)/)?.[1] || issue.id;
        if (!issueId) return null;

        return comicVineRequest(`/issue/4000-${issueId}/`, {
            field_list: "id,name,issue_number,image,volume,description"
        }).then((issueData) => issueData.results);
    }))).then((issues) => issues.filter(Boolean).filter(isMarvelIssue));
}

function loadComicByName() {
    removePreviousComics();

    loadComicVineIssuesByTitle(ComicName.value)
        .then((issues) => {
            displayComicVineIssues(issues);
            setWarning("Warning2", issues.length ? "" : "No comic issues found.");
        })
        .catch((err) => {
            console.error(err);
            setWarning("Warning2", "Unable to fetch comic issues from Comic Vine.");
            displayFallbackComics();
        });
}

ComicName.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        if (!ComicName.value.trim()) {
            setWarning("Warning2", "*Please Enter the Comic Name");
        } else {
            setWarning("Warning2", "");
            loadComicByName();
        }
    }
});

SearchComicByTitle.addEventListener("click", function () {
    if (!ComicName.value.trim()) {
        setWarning("Warning2", "*Please Enter the Comic Name");
    } else {
        setWarning("Warning2", "");
        loadComicByName();
    }
});

function loadComicByID() {
    removePreviousComics();

    if (!hasValidSuperheroConfig()) {
        displayFallbackComics();
        setWarning("Warning2", "Demo mode active: add your Superhero API token in the script to enable live results.");
        return;
    }

    const url = `https://www.superheroapi.com/api.php/${SUPERHERO.apiKey}/${encodeURIComponent(ComicByID.value.trim())}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error(response.statusText || "Superhero API request failed.");
            return response.json();
        })
        .then((data) => {
            if (data?.response === "error") {
                throw new Error(data.error || "No results found.");
            }
            const hero = getSuperheroResults(data)[0];
            if (!hero?.name) throw new Error("Character ID was not found.");

            return loadComicVineIssuesForHero(hero);
        })
        .then((issues) => {
            displayComicVineIssues(issues);
            setWarning("Warning2", issues.length ? "" : "No comic issues found for this character.");
        })
        .catch((err) => {
            console.error(err);
            setWarning("Warning2", "Unable to fetch this character's comics. Showing demo content instead.");
            displayFallbackComics();
        });
}

ComicByID.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        if (!ComicByID.value.trim()) {
            setWarning("Warning2", "*Please Enter the Character ID");
        } else {
            setWarning("Warning2", "");
            loadComicByID();
        }
    }
});

SearchComicByID.addEventListener("click", function () {
    if (!ComicByID.value.trim()) {
        setWarning("Warning2", "*Please Enter the Character ID");
    } else {
        setWarning("Warning2", "");
        loadComicByID();
    }
});

function displayFallbackDescription() {
    clearDescription();

    const imgDiv = document.createElement("div");
    const comicDesc = document.createElement("div");
    const detailsFile = document.createElement("div");
    const title = document.createElement("h2");
    const desc = document.createElement("p");

    imgDiv.className = "img-0";
    detailsFile.className = "description-details";
    comicDesc.className = "comic-img";
    imgDiv.style.backgroundImage = "linear-gradient(to bottom, transparent 55%, black), url(dominoe.jpg)";
    title.innerText = "X-Men (2010) #29";
    desc.innerText = "With the X-Men suffering from inner turmoil, a lost team of Skrulls infiltrates Utopia. As Pixie is discovered missing, the X-Men fear the worst.";

    detailsFile.appendChild(title);
    detailsFile.appendChild(desc);
    comicDesc.appendChild(imgDiv);
    descriptionContainer.appendChild(comicDesc);
    descriptionContainer.appendChild(detailsFile);
}

function displayComicVineDescription(issue) {
    if (!issue) {
        displayFallbackDescription();
        return;
    }

    clearDescription();

    const imgDiv = document.createElement("div");
    const comicDesc = document.createElement("div");
    const detailsFile = document.createElement("div");
    const title = document.createElement("h2");
    const desc = document.createElement("p");

    const series = issue.volume?.name ? `Series: ${issue.volume.name}` : "";
    const issueNumber = issue.issue_number ? `Issue: #${issue.issue_number}` : "";
    const description = issue.description
        ? new DOMParser().parseFromString(issue.description, "text/html").body.textContent.trim()
        : "Description not available for this issue.";

    imgDiv.className = "img-0";
    detailsFile.className = "description-details";
    comicDesc.className = "comic-img";
    imgDiv.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${issue.image?.original_url || issue.image?.super_url || "https://via.placeholder.com/500x750?text=No+Cover"})`;
    title.innerText = issue.name || "Untitled comic issue";
    desc.innerText = [series, issueNumber, description].filter(Boolean).join("\n\n");

    detailsFile.appendChild(title);
    detailsFile.appendChild(desc);
    comicDesc.appendChild(imgDiv);
    descriptionContainer.appendChild(comicDesc);
    descriptionContainer.appendChild(detailsFile);
}

function loadComicVineDescription(value) {
    clearDescription();

    const searchValue = value.trim();
    const issueId = searchValue.match(/^(?:4000-)?(\d+)$/)?.[1];
    const request = issueId
        ? comicVineRequest(`/issue/4000-${issueId}/`, {
            field_list: "id,name,description,issue_number,image,volume"
        })
        : comicVineRequest("/search/", {
            query: searchValue,
            resources: "issue",
            limit: "1"
        }).then((searchData) => {
            const issue = searchData.results?.[0];
            if (!issue?.api_detail_url) throw new Error("Comic issue was not found.");

            const foundIssueId = issue.api_detail_url.match(/4000-(\d+)/)?.[1] || issue.id;
            if (!foundIssueId) throw new Error("Comic issue was not found.");

            return comicVineRequest(`/issue/4000-${foundIssueId}/`, {
                field_list: "id,name,description,issue_number,image,volume"
            });
        });

    request
        .then((issueData) => {
            displayComicVineDescription(issueData.results);
            setWarning("Warning3", "");
        })
        .catch((err) => {
            console.error(err);
            setWarning("Warning3", "Comic issue not found. Try its title or a number listed by Comic Vine.");
            displayFallbackDescription();
        });
}

function loadDescriptionByISBN() {
    loadComicVineDescription(isbnInput.value);
}

function loadDescriptionByUPC() {
    loadComicVineDescription(upcInput.value);
}

function clearDescription() {
    if (descriptionContainer) descriptionContainer.innerHTML = "";
}

upcInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        if (!upcInput.value.trim()) {
            setWarning("Warning3", "*Please Enter the UPC ID");
        } else {
            setWarning("Warning3", "");
            loadDescriptionByUPC();
        }
    }
});

SearchComicByUPC.addEventListener("click", function () {
    if (!upcInput.value.trim()) {
        setWarning("Warning3", "*Please Enter the UPC ID");
    } else {
        setWarning("Warning3", "");
        loadDescriptionByUPC();
    }
});

isbnInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        if (!isbnInput.value.trim()) {
            setWarning("Warning3", "*Please Enter the ISBN ID");
        } else {
            setWarning("Warning3", "");
            loadDescriptionByISBN();
        }
    }
});

SearchComicByISBN.addEventListener("click", function () {
    if (!isbnInput.value.trim()) {
        setWarning("Warning3", "*Please Enter the ISBN ID");
    } else {
        setWarning("Warning3", "");
        loadDescriptionByISBN();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    loadStarterCharacters();
    displayFallbackComics();
    displayFallbackDescription();
});
