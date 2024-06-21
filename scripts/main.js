"use strict";

var userLang = navigator.language || navigator.userLanguage;

window.onload = function() {
    console.log("onLoad Function");
    fetchRecommendedPodcasts();
    const resultsDiv = document.getElementById('podcast-list');
    resultsDiv.innerHTML = '<p class="loading-message">Loading recommended Podcasts...</p>';
};

function cloneImage(event) {
    const clickedImage = event.target;
    const clonedImage = clickedImage.cloneNode(true);
    clickedImage.parentNode.appendChild(clonedImage);
}

function searchPodcasts() {
    const searchTitle = document.getElementById('search-title').value;
    const resultsDiv = document.getElementById('podcast-list');
    resultsDiv.innerHTML = '<p>Search is running...</p>';
    fetchPodcasts(searchTitle);
}

async function fetchPodcasts(title) {
    let url = new URL('https://api.fyyd.de/0.2/search/podcast/');
    url.searchParams.append('title', title);
    console.log('URL:', url.href);
    try {
        const response = await fetch(url);
        const data = await response.json();
        insertSearchResults(data);
        console.log(data);
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        document.getElementById('podcast-list').innerHTML = '<p>Error fetching podcasts. Please try again later.</p>';

    }
}

async function fetchRecommendedPodcasts() {
    let url = new URL('https://api.fyyd.de/0.2/search/podcast/');
    url.searchParams.append('title', makeid(1));
    console.log('URL:', url.href);
    try {
        const response = await fetch(url);
        const data = await response.json();
        insertSearchResults(data);
        console.log(data);
    } catch (error) {
        console.error('Error fetching recommended podcasts:', error);
        document.getElementById('podcast-list').innerHTML = '<p>Error fetching recommended podcasts. Please try again later.</p>';

    }
}

function insertSearchResults(data) {
    const resultsDiv = document.getElementById('podcast-list');
    resultsDiv.innerHTML = '';
    data.data.forEach(podcast => {
        const podcastDiv = document.createElement('div');
        const titleDiv = document.createElement('h2');
        const descriptionDiv = document.createElement('p');
        const podcastImage = document.createElement('img');
        const podcastLink = document.createElement('a');

        titleDiv.textContent = podcast.title;
        descriptionDiv.textContent = truncateText(podcast.description, 40);
        podcastImage.src = podcast.layoutImageURL;
        podcastImage.className = 'img'; // Added class for image styling

        podcastDiv.appendChild(titleDiv);
        podcastDiv.appendChild(podcastImage);
        podcastDiv.appendChild(descriptionDiv);

        podcastLink.href = `podcastDash.html?id=${encodeURIComponent(podcast.id)}&title=${encodeURIComponent(podcast.title)}&description=${encodeURIComponent(podcast.description)}&image=${encodeURIComponent(podcast.layoutImageURL)}`;
        podcastLink.textContent = "Zum Podcast";
        podcastDiv.appendChild(podcastLink);

        resultsDiv.appendChild(podcastDiv);
    });
}

function truncateText(text, wordLimit) {
    const words = text.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
