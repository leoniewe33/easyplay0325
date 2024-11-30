
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
 
 document.getElementById('closeButton').addEventListener('click', function() {
    document.body.classList.remove('drawer-open');
 });