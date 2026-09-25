const imageArray = ["img2.jpg", "img1.jpg", "img0.jpg", "img3.jpg", "img4.jpg", "img11.jpg", "img12.jpg", "img13.jpg", "img14.jpg", "img15.jpg", "img16.jpg"];

const imageSlider = document.getElementById("carousel");
let imageIndex = 0;

const STARTER_HERO_IDS = ["106", "620", "346"];
const SUPERHERO_API_BASE_URL = "https://f4k8xu5cbb.execute-api.eu-north-1.amazonaws.com";
const COMIC_VINE_API_BASE_URL = `${SUPERHERO_API_BASE_URL}/comic`;
const COMIC_VINE_REQUEST_TIMEOUT_MS = 10000;
const SUPERHERO_REQUEST_TIMEOUT_MS = 10000;
const ISSUE_REQUEST_CONCURRENCY = 3;

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

async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { signal: controller.signal });
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Superhero API request timed out.");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
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
        const url = `${SUPERHERO_API_BASE_URL}/superhero/search?name=${encodeURIComponent(currentQuery)}`;

        return fetchWithTimeout(url, SUPERHERO_REQUEST_TIMEOUT_MS).then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText || "Superhero API request failed.");
            }
            return response.json();
        }).then((data) => {
            if (data?.response === "error") {
                throw new Error(data.error || "No results found.");
            }
            return data;
        });
    }), Promise.reject(new Error("No results found.")));
}

async function comicVineRequest(path, params) {
    const comicPath = path.replace(/^\/+/, "");

    const query = new URLSearchParams(params);

    const url = `${COMIC_VINE_API_BASE_URL}/${comicPath}?${query.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), COMIC_VINE_REQUEST_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(url, { signal: controller.signal });
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Comic Vine request timed out.");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        throw new Error("Comic Vine API request failed.");
    }

    return response.json();
}

async function mapWithConcurrency(items, worker, limit) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runWorker() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex++;

            try {
                results[currentIndex] = {
                    status: "fulfilled",
                    value: await worker(items[currentIndex])
                };
            } catch (reason) {
                results[currentIndex] = { status: "rejected", reason };
            }
        }
    }

    const workerCount = Math.min(limit, items.length);
    await Promise.all(Array.from({ length: workerCount }, runWorker));
    return results;
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
const charactersContainer = document.getElementById("characters");
const ComicName = document.getElementById("Comic-title-input");
const SearchComicByTitle = document.getElementById("SearchComicByTitle");
const ComicByID = document.getElementById("Comic-id-input");
const SearchComicByID = document.getElementById("SearchComicByID");
const ComicContainer = document.getElementsByClassName("comics")[0];
const issueInput = document.getElementById("Issue-input");
const SearchComicByIssue = document.getElementById("SearchComicByIssue");
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
    const searchValue = CharacterName.value.trim();
    CharacterName.value = "";

    superheroSearch(searchValue)
        .then((data) => displayCharacters(data))
        .catch((err) => {
            console.error(err);
            setWarning("Warning1", "No character found. Try a full name, such as Iron Man or Spider-Man.");
            removePreviousCharacter();
        });
}

function loadStarterCharacters() {
    Promise.all(STARTER_HERO_IDS.map((id) => fetchWithTimeout(
        `${SUPERHERO_API_BASE_URL}/superhero/${id}`,
        SUPERHERO_REQUEST_TIMEOUT_MS
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
        const issueLabel = document.createElement("p");
        const comicIdLabel = document.createElement("p");
        const series = document.createElement("p");

        comicBox.className = "comic";
        comicImg.className = "img-0";
        detailsDiv.className = "details";

        title.innerText = comic.title;
        comicIdLabel.innerText = `ID: ${comic.id}`;
        issueLabel.innerText = `Issue: #${comic.issueNumber}`;
        series.innerText = `Series: ${comic.series}`;
        comicImg.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${comic.image})`;

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(comicIdLabel);
        detailsDiv.appendChild(issueLabel);
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

async function loadComicVineIssuesForHero(hero) {
    const searchData = await comicVineRequest("/search/", {
        query: hero.name,
        resources: "character",
        limit: "1"
    });

    const character = searchData.results?.[0];

    if (!character?.id) {
        throw new Error("Character was not found in Comic Vine.");
    }

    const characterData = await comicVineRequest(
        `/character/4005-${character.id}/`,
        {
            field_list: "issue_credits"
        }
    );

    const credits = characterData.results?.issue_credits || [];
    const issueResults = await mapWithConcurrency(credits.slice(0, 12), async (credit) => {
        const issueId =
            credit.api_detail_url?.match(/4000-(\d+)/)?.[1] || credit.id;

        if (!issueId) return null;

        const issueData = await comicVineRequest(
            `/issue/4000-${issueId}/`,
            {
                field_list: "id,name,issue_number,image,volume"
            }
        );

        if (issueData.results) {
            return issueData.results;
        }
        return null;
    }, ISSUE_REQUEST_CONCURRENCY);

    return issueResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .filter(Boolean)
        .filter(isMarvelIssue);
}

async function loadComicVineIssuesByTitle(title) {
    const searchData = await comicVineRequest("/search/", {
        query: title.trim(),
        resources: "issue",
        limit: "12",
        field_list: "id,name,issue_number,image,volume"
    });

    const issueResults = await mapWithConcurrency(searchData.results || [], async (issue) => {
        const issueId =
            issue.api_detail_url?.match(/4000-(\d+)/)?.[1] || issue.id;

        if (!issueId) return null;

        const issueData = await comicVineRequest(
            `/issue/4000-${issueId}/`,
            {
                field_list: "id,name,issue_number,image,volume,description"
            }
        );

        if (issueData.results) {
            return issueData.results;
        }
        return null;
    }, ISSUE_REQUEST_CONCURRENCY);

    return issueResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .filter(Boolean)
        .filter(isMarvelIssue);
}

function loadComicByName() {
    removePreviousComics();
    const searchValue = ComicName.value.trim();
    ComicName.value = "";

    loadComicVineIssuesByTitle(searchValue)
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

    const characterId = ComicByID.value.trim();
    ComicByID.value = "";
    const url = `${SUPERHERO_API_BASE_URL}/superhero/${encodeURIComponent(characterId)}`;

    fetchWithTimeout(url, SUPERHERO_REQUEST_TIMEOUT_MS)
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

function loadDescriptionByIssueOrTitle() {
    const searchValue = issueInput.value.trim();
    issueInput.value = "";
    loadComicVineDescription(searchValue);
}

function clearDescription() {
    if (descriptionContainer) descriptionContainer.innerHTML = "";
}

issueInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        if (!issueInput.value.trim()) {
            setWarning("Warning3", "*Please enter an issue ID or title");
        } else {
            setWarning("Warning3", "");
            loadDescriptionByIssueOrTitle();
        }
    }
});

SearchComicByIssue.addEventListener("click", function () {
    if (!issueInput.value.trim()) {
        setWarning("Warning3", "*Please enter an issue ID or title");
    } else {
        setWarning("Warning3", "");
        loadDescriptionByIssueOrTitle();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    loadStarterCharacters();
    displayFallbackComics();
    displayFallbackDescription();
});
