const imageArray = ["img2.jpg", "img1.jpg", "img0.jpg", "img3.jpg", "img4.jpg", "img11.jpg", "img12.jpg", "img13.jpg", "img14.jpg", "img15.jpg", "img16.jpg"];
let slider = document.getElementById("carousel")
let imageindex = 0;
let API = "97f7d31035731dec9658307c50fc8aca"
let Hash = "11df1c65f26cd067ffd321103f292e75"
sliding = () => {
    // console.log(imageArray[imageindex] + "is displaying")
    slider.style.backgroundImage = `url(${imageArray[imageindex]})`;
    imageindex++;
    if (imageindex > imageArray.length - 1) {
        imageindex = 0;
    }
    setTimeout(sliding, 10000);
}
window.addEventListener('load', sliding);


//**Fetching the Charcters Image and id using Name */
let CharacterName = document.getElementById("character")
let SearchCharacter = document.getElementById("SearchCharacter")
let charactersContainer = document.getElementById("charcters")

//https://gateway.marvel.com/v1/public/comics?titleStartsWith=iron&limit=15&ts=1&apikey=97f7d31035731dec9658307c50fc8aca&hash=11df1c65f26cd067ffd321103f292e75
CharacterName.addEventListener("keyup", function (e) {
    if (e.key == "Enter") {
        if (CharacterName.value == "") {
            document.getElementById("Warning1").innerText = "*Please Enter the Character Name"
        }
        else {
            document.getElementById("Warning1").innerText = ""
            loadCharcterID();
        }
    }
})
SearchCharacter.addEventListener("click", function () {
    if (CharacterName.value == "") {
        document.getElementById("Warning1").innerText = "*Please Enter the Character Name"
    }
    else {
        document.getElementById("Warning1").innerText = ""
        loadCharcterID();
    }
})
function loadCharcterID() {
    removePreviousCharacter();
    let url = `https://gateway.marvel.com/v1/public/characters?nameStartsWith=${CharacterName.value}&limit=15&ts=1&apikey=${API}&hash=${Hash}`
    fetch(url).then(function (response) {
        // console.log(response);
        if (!response.ok) {
            document.getElementById("Warning1").innerText = response.statusText
        }
        else {
            return response.json();
        }

    }).then(function (data) {
        console.log(data);
        displayCharacters(data);
    }).catch(function (err) {
        document.getElementById("Warning1").innerText = err
    })
}
function displayCharacters(data) {
    CharacterName.value = ""
    for (let i = 0; i < data.data.results.length; i++) {
        if (!data.data.results[i].thumbnail.path.includes("image_not_available")) {
            let chaarcterbox = document.createElement("div");
            let characterImg = data.data.results[i].thumbnail.path + '/portrait_uncanny.jpg'
            let imgDiv = document.createElement("div");
            imgDiv.className = "img-0";

            let detailsDiv = document.createElement("div");
            let name = document.createElement("p")
            let id = document.createElement("p")

            name.innerHTML = data.data.results[i].name;
            id.innerHTML = "ID: " + data.data.results[i].id;
            imgDiv.style.backgroundImage = `linear-gradient(to bottom, transparent 55%, black), url(${characterImg})`

            chaarcterbox.className = "character"
            detailsDiv.className = "details"

            detailsDiv.appendChild(name)
            detailsDiv.appendChild(id)

            chaarcterbox.appendChild(imgDiv)
            chaarcterbox.appendChild(detailsDiv)

            charactersContainer.appendChild(chaarcterbox)
        }
    }
}

function removePreviousCharacter() {
    charactersContainer.innerHTML = ""
}



//***Searching Comics by title */
let ComicName = document.getElementById("Comic-title-input")
let SearchComicByTitle = document.getElementById("SearchComicByTitle")
let ComicContainer = document.getElementsByClassName("comics")[0]
ComicName.addEventListener("keyup", function (e) {
    if (e.key == "Enter") {

        if (ComicName.value == "") {
            document.getElementById("Warning2").innerText = "*Please Enter the Comic Name"
        }
        else {
            document.getElementById("Warning2").innerText = ""
            loadComicByName();
        }
    }
})
SearchComicByTitle.addEventListener("click", function (e) {
    if (ComicName.value == "") {
        document.getElementById("Warning2").innerText = "*Please Enter the Comic Name"
    }
    else {
        document.getElementById("Warning2").innerText = ""
        loadComicByName();
    }
})
function loadComicByName() {
    removePreviousComics();
    let url = `https://gateway.marvel.com/v1/public/comics?titleStartsWith=${ComicName.value}&limit=15&ts=1&apikey=${API}&hash=${Hash}`
    fetch(url).then(function (response) {
        console.log(response);
        if (!response.ok) {
            document.getElementById("Warning2").innerText = response.statusText
        }
        else {
            return response.json();
        }

    }).then(function (data) {
        // console.log(data);
        displayComics(data);
    })
}
//*Search comic by character id */
let ComicByID = document.getElementById("Comic-id-input")
let SearchComicByID = document.getElementById("SearchComicByID")

ComicByID.addEventListener("keyup", function (e) {
    if (e.key == "Enter") {
        if (ComicByID.value == "") {
            document.getElementById("Warning2").innerText = "*Please Enter the Comic Name"
        }
        else {
            document.getElementById("Warning2").innerText = ""
            loadComicByID();
        }
    }
})
SearchComicByID.addEventListener("click", function (e) {
    if (ComicByID.value == "") {
        document.getElementById("Warning2").innerText = "*Please Enter the Comic Name"
    }
    else {
        document.getElementById("Warning2").innerText = ""
        loadComicByID();
    }
})
function loadComicByID() {
    removePreviousComics();
    let url = `https://gateway.marvel.com/v1/public/characters/${ComicByID.value}/comics?limit=100&ts=1&apikey=${API}&hash=${Hash}`;
    fetch(url).then(function (response) {
        // console.log(response);
        if (!response.ok) {
            document.getElementById("Warning2").innerText = response.statusText
        }
        else {
            return response.json();
        }

    }).then(function (data) {
        // console.log(data);
        displayComics(data);
    })

}



function displayComics(data) {
    ComicByID.value = ""
    ComicName.value = ""
    console.log(data);
    for (let i = 0; i < data.data.results.length; i++) {
        if (!data.data.results[i].thumbnail.path.includes("image_not_available")) {
            let comicbox = document.createElement("div")
            let comicImg = document.createElement("div")
            let detailsDiv = document.createElement("div")
            let ComicName = document.createElement("p")
            let ComicISBN = document.createElement("p")
            let comicUPC = document.createElement("p")

            let imgpath = data.data.results[i].thumbnail.path + '/portrait_uncanny.jpg';

            comicImg.className = "img-0"
            detailsDiv.className = "details"
            comicbox.className = "comic"

            comicImg.style.backgroundImage = 'linear-gradient(to bottom, transparent 55%, black), url(' + imgpath + ')';
            ComicName.innerHTML = data.data.results[i].title;
            comicUPC.innerHTML = "UPC: " + data.data.results[i].upc;
            ComicISBN.innerHTML = "ISBN: " + data.data.results[i].isbn;

            if (comicUPC.innerHTML == "UPC: ") {
                comicUPC.innerHTML = "NOt AVailable"
            }
            if (ComicISBN.innerHTML == "ISBN: ") {
                ComicISBN.innerHTML = "NOt AVailable"
            }

            detailsDiv.appendChild(ComicName)
            detailsDiv.appendChild(comicUPC)
            detailsDiv.appendChild(ComicISBN)

            comicbox.appendChild(comicImg)
            comicbox.appendChild(detailsDiv)


            ComicContainer.appendChild(comicbox)
        }
    }
}

function removePreviousComics() {
    ComicContainer.innerHTML = "";
}




// **----------------------------------------Descrption Details--------------------------------------------------------
let upcInput = document.getElementById("UPC-input")
let isbnInput = document.getElementById("ISBN-input")

let SearchComicByUPC = document.getElementById("SearchComicByUPC")
let SearchComicByISBN = document.getElementById("SearchComicByISBN")

let descriptionContainer = document.getElementsByClassName("description")[0]

upcInput.addEventListener("keyup", function (e) {
    if (e.key == "Enter") {
        if (upcInput.value == "") {
            document.getElementById("Warning3").innerText = "*Please Enter the UPC ID"
        }
        else {
            document.getElementById("Warning3").innerText = ""
            loadDescriptionByUpc();
        }
    }
})

SearchComicByUPC.addEventListener("click", function (e) {
    if (upcInput.value == "") {
        document.getElementById("Warning3").innerText = "*Please Enter the UPC ID"
    }
    else {
        document.getElementById("Warning3").innerText = ""
        loadDescriptionByUpc();
    }
})


isbnInput.addEventListener("keyup", function (e) {
    if (e.key == "Enter") {
        if (isbnInput.value == "") {
            document.getElementById("Warning3").innerText = "*Please Enter the ISBN ID"
        }
        else {
            document.getElementById("Warning3").innerText = ""
            loadDescriptionByisbn();
        }
    }
})

SearchComicByISBN.addEventListener("click", function (e) {
    if (isbnInput.value == "") {
        document.getElementById("Warning3").innerText = "*Please Enter the ISBN ID"
    }
    else {
        document.getElementById("Warning3").innerText = ""
        loadDescriptionByisbn();
    }
})


function loadDescriptionByisbn() {
    clearDescrption();
    let url = `https://gateway.marvel.com/v1/public/comics?isbn=${isbnInput.value}&ts=1&apikey=${API}&hash=${Hash}`;
    fetch(url).then(function (response) {
        // console.log(response);
        if (!response.ok) {
            document.getElementById("Warning3").innerText = response.statusText
        }
        else {
            return response.json();
        }

    }).then(function (data) {
        // console.log(data);
        displayDescription(data);
    })

}

function loadDescriptionByUpc() {
    clearDescrption();
    let url = `https://gateway.marvel.com/v1/public/comics?upc=${upcInput.value}&ts=1&apikey=${API}&hash=${Hash}`;
    fetch(url).then(function (response) {
        // console.log(response);
        if (!response.ok) {
            document.getElementById("Warning3").innerText = response.statusText
        }
        else {
            return response.json();
        }

    }).then(function (data) {
        // console.log(data);
        displayDescription(data);
    })
}

function displayDescription(data) {
    console.log(data);
    let imagePath = data.data.results[0].thumbnail.path + '/portrait_uncanny.jpg'
    let imgdiv = document.createElement('div')
    let comicDesc = document.createElement('div')
    let detailsfile = document.createElement('div')
    let title = document.createElement('h2')
    let desc = document.createElement('p')

    imgdiv.className = "img-0"
    detailsfile.className = "description-details"
    comicDesc.className = "comic-img"

    imgdiv.style.backgroundImage = 'linear-gradient(to bottom, transparent 55%, black), url(' + imagePath + ')'
    title.innerHTML = data.data.results[0].title

    if (data.data.results[0].description == null) {
        desc.innerHTML = "Sorry Not Available 🥲🥲🥲"
    }
    else {
        desc.innerHTML = data.data.results[0].description
    }

    detailsfile.appendChild(title)
    detailsfile.appendChild(desc)

    comicDesc.appendChild(imgdiv)

    descriptionContainer.appendChild(comicDesc)
    descriptionContainer.appendChild(detailsfile)

}


function clearDescrption() {
    descriptionContainer.innerHTML = ""
}
// clearDescrption();
