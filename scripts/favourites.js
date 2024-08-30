//Funktionalität der Navigation
document.getElementById('menuButton').addEventListener('click', function() {
    document.body.classList.toggle('drawer-open');
});
  document.addEventListener('click', function(event) {
    var drawer = document.getElementById('drawer');
    var menuButton = document.getElementById('menuButton');

    if(!drawer.contains(event.target) && !menuButton.contains(event.target)) {
        document.body.classList.remove('drawer-open');
    }
});

document.getElementById('searchButton').addEventListener('click', function() {
    var searchBar = document.getElementById('podcast-search');
    searchBar.classList.toggle('visible');
    if (searchBar.classList.contains('visible')) {
    document.getElementById('search-title').focus();
    }       
 });

//Favoriten hinzufügen --> im Local Cache speichern
function addFavourite() {
    console.log("favourite");
    const podcastId = getQueryParams().id; 
    
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (!favorites.includes(podcastId)) {
        favorites.push(podcastId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert("Podcast wurde zu den Favoriten hinzugefügt!");
    } else {
        removeFavourite(podcastId)
    }
}

//Favorite löschen --> aus dem Local Cache entfernen, dabei wird der Local Cache ohne den jeweiligen Podcast kopiert und dann ersetzt
function removeFavourite(podcastId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== podcastId);
    localStorage.setItem('favorites', JSON.stringify(favorites));

    alert("Podcast wurde aus den Favoriten entfernt!");
}



 // Alle Funktion, die beim Laden der Seite aufgerufen werden, dabei werden die Favoriten aus dem Local Cache geladen und jedes Element einzeln eingefügt
 document.addEventListener('DOMContentLoaded', function() {
    console.log("onLoad Function");
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log(favorites)
    favorites.forEach(element => {
        console.log(element);
        insertFavourite(element);
    });
    if(favorites == 0)
    {
        var div = document.getElementById("fav-div");
        div.innerHTML = "Du hast noch keine Favoriten"
    }
});

//Das Div der Favoriten mit dem Podcast ausfüllen
async function insertFavourite(id) {
    showLoadingAnimation();
var div = document.getElementById("fav-div");
let url = new URL('https://api.fyyd.de/0.2/podcast');
url.searchParams.append("podcast_id", id);
console.log('URL:', url.href);
try {
const response = await fetch(url);
const data = await response.json();
console.log(data.data.title);

const podcastDiv = document.createElement('div');
const podcastImage = document.createElement('img');
const podcastTitle = document.createElement('h4');
const removeBtn = document.createElement('input');
const link = document.createElement("a");
removeBtn.setAttribute("type", "button");
removeBtn.setAttribute("value", "Entfernen");
removeBtn.className = "button-remove";

//remove Btn Click Funktion
removeBtn.onclick = function(event) {
event.preventDefault();
removeFavourite(id);
podcastDiv.remove();
location.reload(); // Aktualisiert die Seite
};
link.href = `podcastDash.html?id=${encodeURIComponent(id)}`;
//podcastLink.target = "_blank"; besser fürs Abspielen im Hintergrund aber nervig, da zu viele Tabs
podcastTitle.innerHTML = data.data.title;
podcastImage.src = data.data.layoutImageURL;
podcastDiv.appendChild(podcastImage);
podcastDiv.appendChild(podcastTitle);
podcastDiv.appendChild(removeBtn);
link.appendChild(podcastDiv)
div.appendChild(link);
hideLoadingAnimation();

}
catch (error) {
console.error('Error fetching recommended podcasts:', error);
document.getElementById('podcast-list').innerHTML = '<p class="loading-message">Fehler beim Laden empfohlener Podcasts. Bitte probiere es später nochmal.</p>';
}
}

//entfernen eines Favoriten
function removeFavourite(podcastId) {
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
console.log(podcastId);
favorites = favorites.filter(id => id !== podcastId);
localStorage.setItem('favorites', JSON.stringify(favorites));
}
   document.getElementById('closeButton').addEventListener('click', function() {
    document.body.classList.remove('drawer-open');
 });

 //Funktionen für die Animationen
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
