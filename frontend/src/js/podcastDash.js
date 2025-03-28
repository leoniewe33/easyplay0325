    import Haken from '/images/Haken.png';
    import PlayButton from '/images/play-button.png';
    
    var episodeCount = 20;
    var URLplaying = null;
    loadFavorites();
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

        function getQueryParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                id: params.get('id'),
            };
        }

        //Podcast für das Dash bekommen über id die in URL übergeben wird
        async function getPodcast()
        {
            let url = new URL('https://api.fyyd.de/0.2/podcast/');
            url.searchParams.append('podcast_id', getQueryParams().id);
            console.log('URL:', url.href);
            try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            document.getElementById('podcast-title').textContent = data.data.title;
            document.getElementById('podcast-description').textContent = data.data.description;
            document.getElementById('podcast-image').src = data.data.layoutImageURL;
            } catch (error) {
            console.error('Error fetching podcasts:', error);
            document.getElementById('podcast-list').innerHTML = '<p class="loading-message">Fehler beim Laden von Podcasts. Bitte probiere es später nochmal.</p>';

            }
        }

    

       //Wenn die Seite aufgerufen wird werden die alle Inhalte geladen inkl. Animation
        document.addEventListener('DOMContentLoaded', function() {
            showLoadingAnimation();
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            getPodcast(id);
            fetchAudio(id,episodeCount);
            const podcastId = getQueryParams().id;
    
    
            const searchInput = document.getElementById('search-title');
            if (searchInput) {
                searchInput.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter') {
                        console.log("Enter key pressed");
                        searchPodcasts();
                    }
                });
            } else {
                console.error("Search input field not found");
            }
        });
        

        async function fetchPodcast() {
            let url = new URL('https://api.fyyd.de/0.2/podcast/');
            url.searchParams.append('podcast_id', getQueryParams().id);
            //url.searchParams.append('count', '10');
            console.log('URL:', url.href);
            try {
            const response = await fetch(url);
            const data = await response.json();
            insertEpisodes(data);
            document.getElementById('audio-player').load();
            } catch (error) {
            console.error('Error fetching podcasts:', error);
            document.getElementById('podcast-list').innerHTML = '<p class="loading-message">Fehler beim Laden von Podcasts. Bitte probiere es später nochmal.</p>';
            

        }
    }
    //Fetchen der AudioURL mit Erstellen der Divs...
    async function fetchAudio(id, episodeCount) {
        
    let url = new URL('https://api.fyyd.de/0.2/podcast/episodes');
    url.searchParams.append('podcast_id', id);
    url.searchParams.append('count', episodeCount);
    console.log('URL:', url.href);
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        insertEpisodes(data);
        
        
        if (data.data.episodes.length < episodeCount) {
            document.getElementById('moreBtn').style.display = 'none';
        } else {
            document.getElementById('moreBtn').style.display = 'inline'; // "More"-Button anzeigen
        }
        if (episodeCount <= 1) {
            document.getElementById('lessBtn').style.display = 'none';
        } else {
            document.getElementById('lessBtn').style.display = 'inline'; // "Less"-Button anzeigen
        }
        
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        document.getElementById('episodes-div').innerHTML = '<p class="loading-message">Fehler beim Laden von Podcasts. Bitte probiere es später nochmal.</p>';
    }
    hideLoadingAnimation();
}
    //Bei mehr Episoden die geladen werden sollen, nutzen wir die Methode um die Inhalte dynamisch nachzuladen
    function fetchNewAudio(change)
    {     
    if (change === 1) {
        episodeCount += 20;
        fetchAudio(getQueryParams().id, episodeCount);
    }
    if (change === -1) {
        if(episodeCount <= 20)
        {
            episodeCount = 1;
        }else{
            episodeCount -= 20;
        }
        
        fetchAudio(getQueryParams().id, episodeCount);
    }
}
    

//Erstellen der Buttons und Divs mit einer Schleife
function insertEpisodes(data) {
    const resultsDiv = document.getElementById('episodes-div');
    resultsDiv.innerHTML = '';
    var newest = true;

    data.data.episodes.forEach((element, index) => {
        
        const divEpisode = document.createElement("div");
        divEpisode.className = "episode-container";

        const episodeButton = document.createElement('button');
        episodeButton.className = "episode-button";
        
        const image = document.createElement("img");
        image.src = PlayButton;
        image.style = "height: 30px";
        image.className = "episode-play-icon";
        const description = document.createElement("div");
        description.innerHTML = element.description;
        const title = document.createElement("div");
        title.className = "episode-title";
        title.innerHTML = element.title;
        if (newest)
        {
            title.innerHTML += " - <b>Neuste Folge</b>";
            newest = false;
        }

        const time = document.createElement("div");
        time.className = "episode-time";
        time.innerHTML = element.duration_string;

       

        episodeButton.appendChild(image)
        episodeButton.addEventListener('click', function() {
            URLplaying = element.enclosure;
            console.log(URLplaying);
            loadEpisode(element.enclosure);
        });
        divEpisode.appendChild(episodeButton);
        divEpisode.appendChild(title);
        divEpisode.appendChild(time);

        divEpisode.addEventListener('click', function() {
            // Umschalten der Sichtbarkeit der Beschreibung
            if (description.style.display === "none" || description.style.display === "") {
                description.style.display = "block";
            } else {
                description.style.display = "none";
            }
        });

        resultsDiv.appendChild(divEpisode);
        description.className = "episode-description";
        resultsDiv.appendChild(description);
    });
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.animationPlayState = 'paused'; // Pause the animation
    } else {
        console.error("Loading animation element not found.");
    }
}
async function addFavourite() {
    console.log("Favorit wird gespeichert...");
    const podcastId = getQueryParams().id;

    try {
        const response = await fetch('http://backend:3000/favorites', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ podcastId })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById("fav-btn-image").src = Haken;
            console.log("Favoriten aktualisiert:", data.favorites);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Fehler beim Speichern des Favoriten:", error);
    }
}

async function loadFavorites() {
    try {
        const response = await fetch('http://backend:3000/favorites', {
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            const podcastId = getQueryParams().id;
            if (data.favorites.includes(podcastId)) {
                document.getElementById("fav-btn-image").src = Haken;
            }
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten:", error);
    }
}

    document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    
    //Animation anzeigen beim Abspielen bzw. Stoppen
    audioPlayer.addEventListener('play', function() {
        showLoadingAnimation();
    });
    audioPlayer.addEventListener('pause', function() {
        hideLoadingAnimation();
    });
    // Extra Abfrage für das Ende einer Folge
    audioPlayer.addEventListener('ended', function() {
        hideLoadingAnimation();
    });

    
});

//Episode in den Player Laden
async function loadEpisode(episodeUrl) {
    const audioPlayer = document.getElementById('audio-player');
    const audioSource = document.getElementById('audio-source');
    const audioContainer = document.getElementById('audio-container');
    const podcastId = getQueryParams().id;

    URLplaying = episodeUrl;
    audioSource.src = episodeUrl;
    audioPlayer.load();
    
    const savedTime = await loadTimestamp(podcastId, episodeUrl);
    audioPlayer.currentTime = savedTime;
    
    audioContainer.classList.remove('audio-hidden');
    audioPlayer.play();
}
document.getElementById('closeButton').addEventListener('click', function() {
            document.body.classList.remove('drawer-open');
         });


//Funktionen um die Animation zu starten/zu beenden
function showLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.animationPlayState = 'running'; // Start the animation
        loadingAnimation.style.display = 'flex'; // Ensure it's visible
    } else {
        console.error("Loading animation element not found.");
    }
}



document.addEventListener('DOMContentLoaded', loadFavorites);

function hideLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.animationPlayState = 'paused'; // Pause the animation
    } else {
        console.error("Loading animation element not found.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.addEventListener('timeupdate', async function() {
        if (URLplaying) {
            const podcastId = getQueryParams().id;
            const timestamp = audioPlayer.currentTime;
            await saveTimestamp(podcastId, URLplaying, timestamp);
        }
    });
    window.addEventListener('beforeunload', async function() {
        if (URLplaying) {
            const podcastId = getQueryParams().id;
            const timestamp = audioPlayer.currentTime;
            await saveTimestamp(podcastId, URLplaying, timestamp);
        }
    });
    audioPlayer.addEventListener('play', function() {
        showLoadingAnimation();
    });
    audioPlayer.addEventListener('pause', function() {
        hideLoadingAnimation();
    });
    audioPlayer.addEventListener('ended', function() {
        hideLoadingAnimation();
    });
});

async function saveTimestamp(podcastId, episodeUrl, timestamp) {
    try {
        // Erstelle eine eindeutige episodeId aus podcastId und episodeUrl
        const episodeId = `${podcastId}-${encodeURIComponent(episodeUrl)}`;
        
        await fetch('http://backend:3000/progress', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ episodeId, timestamp })
        });
    } catch (error) {
        console.error("Fehler beim Speichern des Fortschritts:", error);
    }
}

// Zeitstempel laden
async function loadTimestamp(podcastId, episodeUrl) {
    try {
        const episodeId = `${podcastId}-${encodeURIComponent(episodeUrl)}`;
        
        const response = await fetch(`http://backend:3000/progress?episodeId=${encodeURIComponent(episodeId)}`, {
            credentials: 'include'
        });
        
        if (!response.ok) return 0;
        const data = await response.json();
        return data.timestamp || 0;
    } catch (error) {
        console.error("Fehler beim Laden des Fortschritts:", error);
        return 0;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    
    audioPlayer.addEventListener('timeupdate', async function() {
        if (URLplaying) {
            const podcastId = getQueryParams().id;
            await saveTimestamp(podcastId, URLplaying, audioPlayer.currentTime);
        }
    });

    window.addEventListener('beforeunload', async function() {
        if (URLplaying) {
            const podcastId = getQueryParams().id;
            await saveTimestamp(podcastId, URLplaying, audioPlayer.currentTime);
        }
    });
});


window.addFavourite = addFavourite;
window.fetchNewAudio = fetchNewAudio;