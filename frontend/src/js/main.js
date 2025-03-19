import ArrowRight from '/images/arrow_right.png';
import Haken from '/images/Haken.png';
import userHaken from '/images/userReg.png';


"use strict";

var userLang = navigator.language || navigator.userLanguage;
var loggedIn = false;
checkLoginStatus();
//Funktionen beim Aufruf der Seite um die Inhalte zu laden
document.addEventListener('DOMContentLoaded', function() {
    console.log("onLoad Function");
    fetchRecommendedPodcasts();
    // checkLoginStatus();
    const resultsDiv = document.getElementById('podcast-list');
    resultsDiv.innerHTML = '<p class="loading-message">Empfohlene Podcast werden geladen...</p>';
    getCategories();
    
    const searchInput = document.getElementById('search-title');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                searchPodcasts();
            }
        });
    } else {
        console.error("Search input field not found");
    }
    
    fetchFavourites();
});

async function fetchFavourites()
{
    try {
        const response = await fetch('http://localhost:10045/favorites', {
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            if (data.favorites.forEach(element => {
                insertFavouriteEpisodes(element);
            }));
            if(data.favorites == 0)
            {   //Wenn man keine Favoriten hat, wird das Panel nicht angezeigt --> wirkt cleaner
                var div = document.getElementById("newestEpisodes");
                div.innerHTML = "";
            }
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten:", error);
    }
    
}

//Einfügen der neusten Episoden der Lieblingspodcasts
async function insertFavouriteEpisodes(id){
    var div = document.getElementById("fav-div");
    let url = new URL('https://api.fyyd.de/0.2/podcast/episodes');
    url.searchParams.append("podcast_id", id);
    url.searchParams.append("count", 1);
    console.log('URL:', url.href);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data.data.episodes.length);


        const podcastDiv = document.createElement('div');
        const podcastImage = document.createElement('img');
        const podcastTitle = document.createElement('h4');
        const link = document.createElement("a");
        link.href = `podcastDash.html?id=${encodeURIComponent(id)}`;
        link.target = "_blank";
        podcastTitle.innerHTML = limitToXWords( data.data.episodes[0].title,6);
        podcastImage.src = data.data.layoutImageURL;
        podcastDiv.appendChild(podcastImage);
        podcastDiv.appendChild(podcastTitle);
        link.appendChild(podcastDiv)
        div.appendChild(link);
        
    }
    catch (error) {
        console.error('Error fetching recommended podcasts:', error);
        document.getElementById('podcast-list').innerHTML = '<p class="loading-message">Fehler beim Laden empfohlener Podcasts. Bitte probiere es später nochmal.</p>';
    }
}

//Suchfunktion die nach dem eingegebenen Titel sucht
function searchPodcasts() {
    const searchTitle = document.getElementById('search-title').value;
    const resultsDiv = document.getElementById('search');
    resultsDiv.innerHTML = '<p class="loading-message">Suche läuft...';
    fetchPodcasts(searchTitle,0);
}

//Holt die benötigte Anfrage von der API und nutzt das Page system um dynamisch nachzuladen
async function fetchPodcasts(title, page) {
    showLoadingAnimation();
    let url = new URL('https://api.fyyd.de/0.2/search/podcast/');
    url.searchParams.append('title', title);
    url.searchParams.append('page', page);
    console.log('URL:', url.href);
    
    const resultsDiv = document.getElementById('search');

    if (page === 0) {
        resultsDiv.innerHTML = '<p class="loading-message suche">Suche läuft...</p>';
    }
    const existingMoreBtn = document.getElementById('more-btn-search');
    if (existingMoreBtn) {
        existingMoreBtn.parentNode.removeChild(existingMoreBtn);
    }
    const loadingMessage = document.createElement('p');
    if(page != 0){
        loadingMessage.textContent = 'Ergebnisse werden geladen...';
    }
    
    loadingMessage.setAttribute('id', 'loading-message');
    resultsDiv.appendChild(loadingMessage);

    try {
        const response = await fetch(url);
        const data = await response.json();
        insertSearchResults(data, page);

        // Remove the loading message
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        // Add "more" button if there are more results
        if (data.data.length > 0) {
            // Create the button element with Material Icon
            const moreBtn = document.createElement('button');
            moreBtn.className = "more-button";
            moreBtn.style = "border: none; background: white;"
            moreBtn.setAttribute("id", "more-btn-search"); // ID for the button
            moreBtn.addEventListener('click', function () {
                console.log("moreBtn");
                fetchPodcasts(title, page + 1);
            });

            // Create the icon element
            const icon = document.createElement('img');
            icon.src = ArrowRight;
            icon.style = "height: 90px; margin-bottom: 125px; padding-left: 40px"
            // Append the icon to the button
            moreBtn.appendChild(icon);

            // Append the button to the container
            resultsDiv.appendChild(moreBtn);
        } else {
            resultsDiv.innerHTML = 'Keine weiteren Ergebnisse.';
        }

    } catch (error) {
        console.error('Error fetching podcasts:', error);
        resultsDiv.innerHTML = '<p class="loading-message">Fehler beim Laden von Podcasts. Bitte probiere es später nochmal.</p>';
    }
    hideLoadingAnimation();

}

//Holt aus allen Podcast eine zufällige Seite
async function fetchRecommendedPodcasts() {
    showLoadingAnimation();
    let url = new URL('https://api.fyyd.de/0.2/podcasts/');
    url.searchParams.append('page',getRandomInt(1370));
    url.searchParams.append('count',30);
    console.log('URL:', url.href);
    try {
        const response = await fetch(url);
        const data = await response.json();
        insertRecommendedResults(data);
    } catch (error) {
        console.error('Error fetching recommended podcasts:', error);
        document.getElementById('podcast-list').innerHTML = '<p class="loading-message">Fehler beim Laden empfohlener Podcasts. Bitte probiere es später nochmal.</p>';

    }
    hideLoadingAnimation();
}
//Zufallsfunktion für Recommended gibt eine Zufallszahl von 0 bis max zurück
function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

//Einfügen der Zufälligen Podcast (Empfohlen sind hier einfach zufällige Podcast, sodass jeder Podcast die Chance hat gesehen zu werden)
function insertRecommendedResults(data) {
    const resultsDiv = document.getElementById('podcast-list');
    resultsDiv.innerHTML = '';
    data.data.forEach(podcast => {
        const podcastDiv = document.createElement('div');
        const titleDiv = document.createElement('h4');
        const descriptionDiv = document.createElement('p');
        const podcastImage = document.createElement('img');
        const podcastLink = document.createElement('a');
        titleDiv.textContent = podcast.title;
        podcastImage.src = podcast.layoutImageURL;
        podcastImage.className = 'img';
        podcastLink.appendChild(podcastImage);
        podcastLink.appendChild(titleDiv);
        podcastLink.href = `podcastDash.html?id=${encodeURIComponent(podcast.id)}`;
        //podcastLink.target = "_blank"; besser fürs Abspielen im Hintergrund aber nervig, da zu viele Tabs
        podcastDiv.appendChild(podcastLink);
        resultsDiv.appendChild(podcastDiv);
    });
}

//Einfügen der suche
function insertSearchResults(data, page) {
    const resultsDiv = document.getElementById('search');
    // Wenn es sich um die erste Seite handelt, wird das div geleert
    if (page === 0) {
        resultsDiv.innerHTML = '';
    }

    data.data.forEach(podcast => {
        const podcastDiv = document.createElement('div');
        const titleDiv = document.createElement('h4');
        const podcastImage = document.createElement('img');
        const podcastLink = document.createElement('a');

        titleDiv.textContent = podcast.title;
        podcastImage.src = podcast.layoutImageURL;
        podcastImage.className = 'img'; // Added class for image styling

        podcastLink.appendChild(podcastImage);
        podcastLink.appendChild(titleDiv);

        podcastLink.href = `podcastDash.html?id=${encodeURIComponent(podcast.id)}`;
        podcastLink.target = "_blank";

        podcastDiv.appendChild(podcastLink);

        resultsDiv.appendChild(podcastDiv);
    });
}

//Limitiert die Wörter für die Podcastfolgen, da diese zu lang für das Grid war, es werden nicht mehr als x Wörter zurückgegeben
function limitToXWords(input,x) {
    const words = input.split(" ");
    if (words.length > x) {
      return words.slice(0, x).join(" ");
    }
    return input;
  }

//laden der Kategorien von der API
async function getCategories() {
    let url = new URL('https://api.fyyd.de/0.2/categories');
    console.log('URL:', url.href);
    try {
        const response = await fetch(url);
        const data = await response.json();
        const div = document.getElementById("categoryContainer");
        div.innerHTML = '';
        const catBtndiv = document.createElement('div');
        const catCount = data.data.length;
        var forCounter = 0;
        var randomCat = Math.floor(Math.random()*catCount+1)
        console.log(randomCat);
        data.data.forEach(element => {
            const catBtn = document.createElement('input');
            catBtn.setAttribute("type", "button");
            catBtn.setAttribute("value", element.name_de);
            catBtn.className = 'category-button';
            forCounter++;
            if(forCounter === randomCat)
                {
                    console.log("fetching" + element.name_de);
                    fetchCategoryPodcasts(element.id,element.name_de,0)
                }
            catBtn.addEventListener('click', function() {
                fetchCategoryPodcasts(element.id,element.name_de,0);
            });

            catBtndiv.appendChild(catBtn);
            
        });
        div.appendChild(catBtndiv);
    } catch (error) {
        console.error('Error fetching categories:', error);
        document.getElementById("categoryContainer").innerHTML = '<p class="loading-message">Fehler beim Laden von Kategorien. Bitte probiere es später nochmal.</p>';
    }
}
//Fetchen der jeweiligen Kategorie, dabei nutzen wir auch hier das Page System zum nachladen um mehr Podcasts anzuzeigen
async function fetchCategoryPodcasts(id, name, page) {
    showLoadingAnimation();
    let url = new URL('https://api.fyyd.de/0.2/category');
    url.searchParams.append('category_id', id);
    url.searchParams.append('page', page);
    console.log('URL:', url.href);
    document.getElementById("category-search-monitor").innerHTML = name

    const resultsDiv = document.getElementById("categoryResult");

    if (page === 0) {
        resultsDiv.innerHTML = '<p class="loading-message">Inhalte der Kategorie ' + name + ' werden geladen...</p>';
    } else {
        const existingMoreBtn = document.getElementById('more-btn');
        if (existingMoreBtn) {
            resultsDiv.removeChild(existingMoreBtn);
        }
        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = "Weitere Podcasts werden geladen...";
        loadingMessage.setAttribute("id", "loading-message");
        resultsDiv.appendChild(loadingMessage);
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        insertCategorySearchResults(data, page === 0);
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            resultsDiv.removeChild(loadingMessage);
        }
//Erstellen des More-Buttons am Ende des Grids um mehr anzuzeigen
const moreBtn = document.createElement('button'); 
moreBtn.setAttribute("type", "button");
moreBtn.setAttribute("id", "more-btn");
moreBtn.style = "border: none; background: white;"
moreBtn.addEventListener('click', function () {
    console.log("moreBtn");
    fetchCategoryPodcasts(id, name, page + 1);
});

const icon = document.createElement('img');
icon.src = ArrowRight;
icon.style.height = "90px";
icon.style.marginBottom = "140px";
icon.style.paddingLeft = "40px";
moreBtn.appendChild(icon);
resultsDiv.appendChild(moreBtn);
    } catch (error) {
        console.error('Error fetching category podcasts:', error);
        document.getElementById("categoryResult").innerHTML = '<p class="loading-message">Fehler beim Laden von Podcasts. Bitte probiere es später nochmal.</p>';
    }
    hideLoadingAnimation();
}

//Einfügen der Ergebnis bei der Kategorie-Suche, isInitialLoad ist hier, dass der Inhalt bereits geladen wurde, dann würde das Div geleert werden
function insertCategorySearchResults(data, isInitialLoad) {
    const resultsDiv = document.getElementById("categoryResult");

    if (isInitialLoad) {
        resultsDiv.innerHTML = '';
    }

    data.data.podcasts.forEach(podcasts => {
        const podcastDiv = document.createElement('div');
        const titleDiv = document.createElement('h4');
        const podcastImage = document.createElement('img');
        const podcastLink = document.createElement('a');

        titleDiv.textContent = podcasts.title;
        podcastImage.src = podcasts.layoutImageURL;
        podcastImage.className = 'img';

        podcastLink.appendChild(podcastImage);
        podcastLink.appendChild(titleDiv);

        podcastLink.href = `podcastDash.html?id=${encodeURIComponent(podcasts.id)}&title=${encodeURIComponent(podcasts.title)}&description=${encodeURIComponent(podcasts.description)}&image=${encodeURIComponent(podcasts.layoutImageURL)}`;
        podcastLink.target = "_blank";
        podcastDiv.appendChild(podcastLink);

        resultsDiv.appendChild(podcastDiv);
    });
}

//Funktionen für die Animation
function showLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.animationPlayState = 'running'; // Start the animation
        loadingAnimation.style.display = 'flex'; // Ensure it's visible
    } else {
        console.error("Loading animation element not found.");
    }
}

function hideLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.animationPlayState = 'paused'; // Pause the animation
    } else {
        console.error("Loading animation element not found.");
    }
}

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById("show-dialog")
		.addEventListener("click", () => {
			document.getElementById("dialog")
				.showModal();
		});
	document.getElementById("close-dialog")
		.addEventListener("click", () => {
			document.getElementById("dialog")
				.close();
		});
    document.getElementById("close-dialog2")
		.addEventListener("click", () => {
			document.getElementById("dialog")
				.close();
		});
        document.getElementById("close-dialog3")
		.addEventListener("click", () => {
			document.getElementById("dialog")
				.close();
		});
});

document.getElementById("showRegister").addEventListener("click", function(event) {
    event.preventDefault();
    document.querySelector(".form-wrapper").classList.add("switch-right");
});

document.getElementById("showLogin").addEventListener("click", function(event) {
    event.preventDefault();
    document.querySelector(".form-wrapper").classList.remove("switch-right");
});

let count= 0;
let isBlocked = false;  
let blockTime = 0;

document.getElementById("Anmeldung").addEventListener("click", async function (event) {
    event.preventDefault();
  
    if (isBlocked) {
        alert(`Sie können sich nicht mehr anmelden. Versuchen Sie es in ${blockTime} Sekunden erneut.`);
        return;
    }
   
    const user = document.getElementById("user").value;
    const password = document.getElementById("passwd").value;

    if (!user || !password) {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }
   
  try{
    const response = await fetch("http://localhost:10045/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
        credentials: "include" // WICHTIG: Session-Cookies mit senden
    });
  
    const result = await response.json();
    alert(result.message);
    window.location.reload();
    checkLoginStatus();
  } catch(error){
    count++;
    console.error("Fehler bei der Anmeldung:", error);
    alert("Anmeldung fehlgeschlagen! Versuch " + count + " von 5.");

    if (count === 5) {
        isBlocked = true;
        blockTime = 30; 
        alert(`Sie haben 5 Fehlversuche erreicht. Die Anmeldung wird für ${blockTime} Sekunden blockiert.`);

        const timer = setInterval(function () {
            blockTime--;
            if (blockTime <= 0) {
                clearInterval(timer);
                isBlocked = false; 
                alert("Die Blockierung wurde aufgehoben. Sie können sich wieder anmelden.");
                count = 0;
            }
        }, 1000);
    }
}
});

 


  
  document.getElementById("registrieren").addEventListener("click", async function () {
    console.log("Registrierungs-Button wurde geklickt!");
  
    const username = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-passwd").value;
  
    try {
      const response = await fetch("http://localhost:10045/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
  
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Fehler bei der Registrierung:", error);
      alert("Registrierung fehlgeschlagen!");
    }
  });
  async function checkLoginStatus() {
    const response = await fetch("http://localhost:10045/session", { credentials: "include" });
    const result = await response.json();
    profilePicture = document.getElementById("IconShow");

    if (result.loggedIn) {
        loggedIn = true;
        profilePicture.src = userHaken;
        console.log("Benutzer ist angemeldet:", result.user);
        loadDropDownWithoutReg();
        const test = document.getElementById("HelloText");
        test.innerHTML = result.user.username;
}};

async function loadDropDownWithoutReg() {
    const userIcon = document.getElementById("IconShow");
    const dialog = document.getElementById("dialog");

    if (!userIcon) {
        console.error("Element 'IconShow' nicht gefunden!");
        return;
    }

    const dropdown = document.createElement("div");
    dropdown.classList.add("user-dropdown");
    dropdown.innerHTML = `
        <ul>
            <a href="profil.html"><li>Profil</li></a>
            <a id="logoutBtn"><li>Logout</li></a>
        </ul>
    `;
    dropdown.style.display = "none";
    document.body.appendChild(dropdown);

    try {
        const response = await fetch("http://localhost:10045/session", { credentials: "include" });
        const data = await response.json();

        if (data.loggedIn) {
            userIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
                dropdown.style.position = "absolute";
                dropdown.style.top = `${userIcon.offsetTop + userIcon.offsetHeight}px`;
                dropdown.style.left = `${userIcon.offsetLeft}px`;
            });

            document.addEventListener("click", (e) => {
                if (!dropdown.contains(e.target) && e.target !== userIcon) {
                    dropdown.style.display = "none";
                }
            });

        } else {
            userIcon.addEventListener("click", () => dialog.showModal());
        }

    } catch (err) {
        console.error("Fehler beim Abrufen des Login-Status:", err);
    }
}
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('changeUsernameButton');
    if (button) {
        button.addEventListener('click', function() {
            console.log("Button wurde geklickt!");
        });
    } else {
        console.error("Button nicht gefunden!");
    }
});

document.getElementById("IconShow").addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

