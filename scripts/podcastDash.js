    var episodeCount = 20;
    var URLplaying = null;
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
        
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
            if (favorites.includes(podcastId)) {
            document.getElementById("fav-btn-image").src="images/Haken.png";
            } else {
            }
    
    
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
        image.src = "images/play-button.png";
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
}
//Episode wird in den Player geladen und abgespielt
function loadEpisode(episodeUrl) {
    const audioPlayer = document.getElementById('audio-player');
    const audioSource = document.getElementById('audio-source');
    audioSource.src = episodeUrl;
    
    audioPlayer.load();
    audioPlayer.play();
    
}
        function addFavourite() {
        console.log("favourite");
        const podcastId = getQueryParams().id;
        
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (!favorites.includes(podcastId)) {
            favorites.push(podcastId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            document.getElementById("fav-btn-image").src="images/Haken.png";
            //alert("Podcast wurde zu den Favoriten hinzugefügt!"); --> wir haben uns dagegen entschieden dieses Feedback zu nutzen, aber wollen es trotzdem stehen lassen
        } else {
            alert("Podcast ist bereits in den Favoriten.");
        }
    }


    //Speichern des Fortschritts in einer Folge durch Local-Cache
    document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.addEventListener('timeupdate', function() {
        if (URLplaying) {
            const podcastId = getQueryParams().id + '-' + URLplaying;//Custom id aus PodcastID und der URL der Episode
            localStorage.setItem(`podcast-${podcastId}-progress`, audioPlayer.currentTime);
        }
    });
    window.addEventListener('beforeunload', function() {
        if (URLplaying) {
            const podcastId = getQueryParams().id + '-' + URLplaying;
            localStorage.setItem(`podcast-${podcastId}-progress`, audioPlayer.currentTime);
        }
    });
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
function loadEpisode(episodeUrl) {
    const audioPlayer = document.getElementById('audio-player');
    const audioSource = document.getElementById('audio-source');
    const audioContainer = document.getElementById('audio-container');

    const podcastId = getQueryParams().id + '-' + episodeUrl;

    URLplaying = episodeUrl;
    audioSource.src = episodeUrl;
    
    audioPlayer.load();

    
    const savedTime = localStorage.getItem(`podcast-${podcastId}-progress`);
    if (savedTime) {
        audioPlayer.currentTime = parseFloat(savedTime);
    }
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

function hideLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.animationPlayState = 'paused'; // Pause the animation
    } else {
        console.error("Loading animation element not found.");
    }
}