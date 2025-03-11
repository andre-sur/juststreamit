
document.addEventListener('DOMContentLoaded', () => {
});
async function fetchDescriptionFromPage(url) {
    try {
        const response = await fetch(url); // Récupère la page JSON depuis l'URL
        if (!response.ok) {
            throw new Error("Pas de données (description)",url);
        }
        const data = await response.json();
        return data.description;
    } catch (error) {
        console.error("Erreur au niveau description :", error);
        return null;
    }
}

async function showDetails(urlimage,url){
    // Afficher une pop-up avec détails
    const response = await fetch(url); 
        const data = await response.json();

        console.log(data.description);
        const popup = document.createElement('div');
        popup.classList.add('popup');
        
        // Contenu de la pop-up
        const popupContent = document.createElement('div');
        popupContent.classList.add('popup-content');
        
        // X de fermeture de la pop-up
        const closeButton = document.createElement('span');
        closeButton.classList.add('close');
        closeButton.innerHTML = '&times;'; 
        closeButton.onclick = function() {
            document.body.removeChild(popup); 
        };
        // Texte à afficher (les détails)
        const text = `
    <img src='${urlimage}' alt="Image" style="width: 100px; height: auto; margin-bottom: 10px;" />
    <br> Titre : ${data.title} <br>
    Année : ${data.year} <br>
    Imdb score : ${data.imdb_score} <br>
    Description : ${data.description} <br>
    Acteurs principaux: ${data.actors} <br>
    Genre: ${data.genres} <br>
`; 
        // Un paragraphe pour le texte
        const popupText = document.createElement('p');
        popupText.innerHTML = text;
    
        // Ajouter texte et x au contenu pop-up
        popupContent.appendChild(closeButton);
        popupContent.appendChild(popupText);
        
        // Insérer contenu pop-up à la pop-up
        popup.appendChild(popupContent);
    
        // Ajouter pop-up au body hmtl
        document.body.appendChild(popup);
    
        // 9. Afficher pop-up
        popup.style.display = 'block';
    };
    

function updateFilmDescription(film)
 {
    if (!film || !film.url) {
        console.error("Film ou URL manquant...URL=", film.title);
        return;
    }
    fetchDescriptionFromPage(film.url)
        .then(long_description => {
            const descriptionElement = document.getElementById("film-description");
            descriptionElement.innerHTML=`
        <h3 class="film-title">${film.title}</h3>
       <p>             </p>
       <p>             </p>
        <p>${long_description}</p>
        <button class="image-button" onclick="showDetails('${movie.image_url}','${movie.url}')">Détails</button>
        
    `;
          
        });
}

async function fetchAllFilms(totalPages) {
    const fetchPromises = [];
    for (let page = 1; page <= totalPages; page++) {
        fetchPromises.push(
            fetch(`http://localhost:8000/api/v1/titles/?page=${page}`)
            .then(response => response.json())  
            .then(data => {
                return data.results;  
            })
        );
    }

    try {
        const results = await Promise.all(fetchPromises);
        const allFilms = results.flat(); 
        console.log('Films récupérés :', allFilms);
        return allFilms;
    } catch (error_1) {
        console.log("Erreur lors de la récupération des films :", error_1);
        alert("Erreur lors du chargement. Veuillez réessayer plus tard.");
        return [];
    }
}

async function getBestFilm(number) {
    const allFilms = await fetchAllFilms(number);
    console.log("tous les films trouvés",allFilms)
    if (allFilms.length === 0) return null;  

    const bestFilm = allFilms.reduce((bestFilm, currentFilm) => {
        const currentScore = parseFloat(currentFilm.imdb_score);
        const bestScore = parseFloat(bestFilm.imdb_score);
    
        if (isNaN(currentScore)) {
            console.log(`imdb_score manquant/invalide pour ${currentFilm.title}`);
            return bestFilm;  
        }
    
        return currentScore > bestScore ? currentFilm : bestFilm;
    });

    if (!bestFilm) {  
       
        alert("pas de film.");

        return null;
    }

    const bestFilmElement = document.getElementById("best-film");
  
    bestFilmElement.innerHTML = `
        <img src="${bestFilm.image_url}" alt="Une belle image">
        
    `;

    updateFilmDescription(bestFilm)

    return {
        bestFilm: bestFilm,
    };
}
async function displayTopMovies(totalPages) {
    console.log("top movies en live !");
    console.log("test !");
    const movies = await fetchAllFilms(totalPages); 
    movies.sort((a, b) => b.imdb_score - a.imdb_score); 

    const moviesList = document.getElementById('movies-list'); 
    moviesList.innerHTML = '';  

    // Affichage des films
    movies.forEach(movie => {
        
        // Un conteneur par film
        const movieElement = document.createElement('div');
        console.log("alors");
        console.log(movieElement);
        movieElement.classList.add('movie-item');  // Ajoute la classe 'movie-item' à chaque film

        // Un élément <img> pour l'image 
        const movieImage = document.createElement('img');
        movieImage.classList.add('movie-image');  
        movieImage.src = movie.image_url; 
        movieImage.alt = movie.title;  

        // Contenu du film (titre et score)
        const movieHtml = `
            <div>
                <div class="movie-title">${movie.title}</div>
                <div class="movie-rating">Note : ${movie.imdb_score}</div>
            </div>
        `;

        // Image et le contenu dans le conteneur
        movieElement.innerHTML = movieHtml;
        movieElement.prepend(movieImage);  // Placer l'image avant le texte (ou après, selon le résultat souhaité)

        // Ajouter le film à la liste
        moviesList.appendChild(movieElement);
    });
}

async function fetchAllGenres(totalPages) {
    const fetchPromises = [];
    for (let page = 1; page <= totalPages; page++) {
        fetchPromises.push(
            fetch(`http://localhost:8000/api/v1/genres/?page=${page}`)
                .then(response => response.json())
                .then(data => data.results.map(genre => ({ genre: genre.name })))
        
                .catch(error => {
                    console.log(`Erreur lors de la récupération de la page ${page}:`, error);
                    return [];
                })
        );
    }

    return Promise.all(fetchPromises)
        .then(genreArrays => {
            const allGenres = genreArrays.flat();
            console.log("Genres récupérés :", allGenres);
            return allGenres;
        })
        .catch(error => {
            console.log("Erreur lors de la récupération des genres :", error);
            return [];
        });
}


async function displayMoviesGenre(page, genre, balise) {
    const movies = await fetchAllFilms(page);
    const filteredMovies = movies.filter(movie => movie.genres.includes(genre));
    filteredMovies.sort((a, b) => b.imdb_score - a.imdb_score);
    const topMovies = filteredMovies.slice(0, 6);

    const moviesList = document.getElementById(balise);
    if (!moviesList) {
        console.error(`L'élément avec l'id ${balise} n'a pas été trouvé.`);
        return;
    }
    
   moviesList.innerHTML='';

    topMovies.forEach((movie,index) => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-image');

        // On masque film si index >4
        const screenWidth = window.innerWidth;
        if (screenWidth>=768 && screenWidth<1023 && index>=4)  {
           movieElement.classList.add('hidden'); // Classe hidden pour masquer
       }
       if (screenWidth<767 && index>=1)  {
        movieElement.classList.add('hidden'); // Classe hidden pour masquer
    }
        const movieHtml = `
            <div class="movie-container">
                <img src="${movie.image_url}" alt="${movie.title}" class="movie-image"/>
                <div class="movie-overlay">
                    <div class="movie-title">${movie.title}</div>
                    <button class="movie-detail-btn" onclick="showDetails('${movie.image_url}','${movie.url}')">Détails</button>
                </div>
            </div>
        `;
        
        movieElement.innerHTML = movieHtml;
        moviesList.appendChild(movieElement);
    
    });
}

function click_viewmore () {
   
    const movieImages = document.querySelectorAll('.movie-image.hidden');
    const toggleButton = document.getElementById('toggleButton');
    const screenWidth = window.innerWidth;

    if (movieImages.length > 0) {
        movieImages.forEach(function(image) {
            image.classList.remove('hidden'); // Démasquer 
        });

        toggleButton.textContent = "Voir moins"; // Modifier texte bouton
    } else {
        // Masque selon la largeur de l'écran
        const allMovieImages = document.querySelectorAll('.movie-image');
        allMovieImages.forEach(function(image, index) {
            // Selon la taille de l'écran
            if (screenWidth >= 768 && screenWidth < 1023 && index >= 4) {
                image.classList.add('hidden'); // écrans intermédiaires
            } else if (screenWidth < 768 && index >= 2) {
                image.classList.add('hidden'); // écrans mobiles
            } else {
                image.classList.remove('hidden'); // films visibles pas concernés
            }
        });

        toggleButton.textContent = "Voir plus"; // Revenir au texte initial
    }
}

// Attacher l'événement de clic au bouton
document.getElementById('toggleButton').addEventListener('click', click_viewmore);


function createDropdownMenu(genreList) {
    const genreSelect = document.getElementById('genre-select');
    if (!genreSelect) {
        console.error("L'élément #genre-select est introuvable.");
        return;
    }
    const defaultOption = document.createElement('option');
    defaultOption.value = "Aucun";
    defaultOption.textContent = "Sélectionnez un genre";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    genreSelect.appendChild(defaultOption);

    genreList.forEach(genreObj => {
        const option = document.createElement('option');
        option.value = genreObj.genre;
        option.textContent = genreObj.genre;
        genreSelect.appendChild(option);
    
    });

    genreSelect.addEventListener('change', function() {
        const selectedGenre = this.value;
        document.getElementById('selected-genre').textContent = selectedGenre || 'Aucun';
        if (selectedGenre) {
            displayMoviesGenre(10, selectedGenre, "genre-selection");
        }
    });


    
}