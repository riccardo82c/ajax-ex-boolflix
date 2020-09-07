/* 
Milestone 1:
	Creare un layout base con una searchbar(una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film.
	Possiamo, cliccando il bottone, cercare sull’ API tutti i film che contengono ciò che ha scritto l’ utente.
	Vogliamo dopo la risposta dell’ API visualizzare a schermo i seguenti valori per ogni film trovato:
	Titolo
	Titolo Originale
	Lingua
	Voto

Milestone 2:
	Trasformiamo il voto da 1 a 10 decimale in un numero intero da 1 a 5, così da permetterci di stampare a schermo un numero di stelle piene che vanno da 1 a 5, lasciando le restanti vuote(troviamo le icone in FontAwesome).
	Arrotondiamo sempre per eccesso all’ unità successiva, non gestiamo icone mezze piene(o mezze vuote: P)
	Trasformiamo poi la stringa statica della lingua in una vera e propria bandiera della nazione corrispondente, gestendo il caso in cui non abbiamo la bandiera della nazione ritornata dall’ API(le flag non ci sono in FontAwesome).
	Allarghiamo poi la ricerca anche alle serie tv.Con la stessa azione di ricerca dovremo prendere sia i film che corrispondono alla query, sia le serie tv, stando attenti ad avere alla fine dei valori simili(le serie e i film hanno campi nel JSON di risposta diversi, simili ma non sempre identici)
	Qui un esempio di chiamata per le serie tv:
	https: //api.themoviedb.org/3/search/tv?api_key=e99307154c6dfb0b4750f6603256716d&language=it_IT&query=scrubs

	Milestone 3:
	aggiungere immagini https: //image.tmdb.org/t/p/w342



	TO DO: 
	overflow hidden dell'overview ?
	css per i tasti di scorrimento 
	scorrimento con la rotella settare dinamicamente la larghezza di ogni immagine
	
	filtro per genere a posteriori su HTML
	
 */

$(function () {

	/* MOUSE WHEEL SCROLL */
	// [0] per utilizzare attachEvent per forza ad un elemento JS (non JQUERY)
	const movie = $('#movie-list')[0];
	const tv = $('#tv-list')[0];

	scroll(movie);
	scroll(tv);
	/* END MOUSE WHEEL SCROLL */

	// focus sull'input
	$('#input').focus();

	// attivazione input con INVIO o CLICK SU ICONA
	$('#input').keydown(function (e) {
		if (e.which == 13 && e.keyCode == 13 && $('#input').val()) {
			findCollection();
		}
	});
	$("#search-btn").click(function () {
		if ($('#input').val()) {
			findCollection();
			$('#input').focus();
		}
	});

	// bottoni per lo scroll
	$('#list').on('click', '.scroll', scrollButtonMovie)
});


/* ******** */
/* FUNZIONI */
/* ******** */

// chiamata AJAX per restituire la stringa
function findCollection() {
	// salvo in una variabile il campo preso da #input
	let query = saveAndReset();
	// chiamate AJAX
	ajaxCall(query, 'movie');
	ajaxCall(query, 'tv');
}

// resetto il DOM, SALVO valore di input e svuoto input 
function saveAndReset() {
	$('#tv-list').empty();
	$('#movie-list').empty();
	createScrollButtons('movie');
	createScrollButtons('tv');
	let value = $("#input").val();
	$("#input").val('');
	return value
}

// chiamata AJAX principale per ritornare i valori di ogni item
function ajaxCall(str, type) {
	$.ajax({
		method: 'GET',
		url: `https://api.themoviedb.org/3/search/${type}`,
		data: {
			api_key: '5735ba8aa714f2161c6a9f7f267223ef',
			language: 'it-IT',
			query: str,
		},
		success: function (obj) {
			// se ci sono risultati
			if (obj.total_results > 0) {
				// stampo la collezione a video in base al tipo
				printCollection(obj, type);
			} else {
				noResult(type);
			}
		},
		error: function () {
			alert('Errore');
		}
	});
}


// stampa collezione in base alla query inserita in input
function printCollection(data, type) {
	// template HB
	var source = $("#entry-template").html();
	var template = Handlebars.compile(source);
	for (let i = 0; i < data.results.length; i++) {
		let thisItem = data.results[i];
		let location;
		type == 'movie' ? location = $('#movie-list') : location = $('#tv-list')
		let hbObj = {
			// id per definire un data id dell'elemento corrente
			idMovie: thisItem.id,
			title: thisItem.title || thisItem.name,
			original_title: thisItem.original_title || thisItem.original_name,
			original_language: langFlags(thisItem.original_language),
			vote_average: star(thisItem.vote_average),
			tipo: checkType(type),
			poster: checkImage(thisItem.poster_path),
			overview: thisItem.overview.substring(0, 190) + '[...]',
		}
		var html = template(hbObj);
		location.append(html);

		/* Chiamata AJAX per ricercare i generi del film corrente */
		// check del genere -  NO RETURN FUNCTION (AJAX call)
		// cerco per genere passando: 1 il tipo (differenzio url in cui cercare), 2 l'id del genere (posso averne più di uno), e l'id dell'elemento corrente per appendere il valore nella posizione corretta)
		let idGeneri = thisItem.genre_ids;
		idGeneri.forEach(element => {
			ajaxGenre(type, element, thisItem.id);
		});

		/* Chiamata AJAX per ricercare gli attori del film corrente*/
		let idItem = thisItem.id;
		ajaxAttori(idItem, type);

		// setto il placeholder
		$('#input').attr('placeholder', 'Inserisci titolo');
	}
}

// funzione per convertire il numero in stelle
function star(int) {
	const sF = '<i class="fas fa-star"></i>';
	const sE = '<i class="far fa-star"></i>';
	const sH = '<i class="fas fa-star-half-alt"></i>'
	// parte decimale
	let dec = int % 1;
	// numero di stelle piene
	let round = Math.floor(int / 2);
	return dec >= .5 ? sF.repeat(round) + sH + sE.repeat(4 - (round)) : sF.repeat(round) + sE.repeat(5 - round)
}

// funzione che ritorna l'immagine se presente sennò ritorna la stringa iniziale
function langFlags(lingua) {
	const language = ['en', 'it', 'fr', 'de', 'es', 'ja'];
	// se la stringa è presente restituisco il tag img sennò la stringa stessa
	if (language.includes(lingua)) {
		return `<img src="img/${lingua}.png" alt="${lingua}">`
	} else {
		return lingua
	}
}

// verifico se esiste qualche item del tipo selezioneto... lo stamo nel container del tipo
function noResult(tipo) {
	let location;
	tipo == 'movie' ? location = $('#movie-list') : location = $('#tv-list')
	console.log('niente da visualizzare');
	location.append(`<p class='no-search'>Il titolo non è presente in ${checkType(tipo)} </p>`);
}

// check se presente l'immagine nel db
function checkImage(path) {
	const defaultImg = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FsvTVRDgI08Y%2Fmaxresdefault.jpg&f=1&nofb=1';
	return path == null ? defaultImg : `https://image.tmdb.org/t/p/w342${path}`
}

// transformo la stringa del genre 
function checkType(genre) {
	return genre == 'movie' ? 'Film' : 'Serie TV'
}

// matching del genere del film con l'array dei generi
function ajaxGenre(type, int, idMovie) {
	$.ajax({
		method: 'GET',
		url: `https://api.themoviedb.org/3/genre/${type}/list?api_key=5735ba8aa714f2161c6a9f7f267223ef&language=it-IT`,
		data: {
			api_key: '5735ba8aa714f2161c6a9f7f267223ef',
			language: 'it-IT'
		},
		success: function (obj) {
			// appendo la stringa corrispondente al genere nell'item con data-id = "id movie corrente"
			$(`.item[data-id="${idMovie}"`).find('.genere').append(`${checkArray(obj.genres, int)} `);
		},
		error: function () {
			console.log('non presente id ' + idMovie);
			$(`.item[data-id="${idMovie}"`).find('.genere').append(`...`);
		}
	});
}

// passo un intero all'array dei generi e restituisco attributoto con id == intero passato
function checkArray(arr, int) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].id == int) {
			return arr[i].name
		}
	}
}

// chiamata ajax per la ricerca attori
function ajaxAttori(id, tipo) {
	$.ajax({
		method: 'GET',
		url: `https://api.themoviedb.org/3/${tipo}/${id}/credits`,
		data: {
			api_key: '5735ba8aa714f2161c6a9f7f267223ef'
		},
		success: function (obj) {
			findNameCast(obj.cast, id);
		},
		error: function () {
			console.log('non presente id ' + id);
			$(`.item[data-id="${id}"`).find('.attori').append(`...`);
		}
	});
}


// matchin del'id con in nome attore
function findNameCast(arr, id) {
	if (arr.length > 0) {
		for (let i = 0; i < 3; i++) {
			if (arr[i] != undefined) {
				$(`.item[data-id="${id}"`).find('.attori').append(`${arr[i].name} `);
			} else {
				return
			}
		}
	} else {
		$(`.item[data-id="${id}"`).find('.attori').append(`...`);
	}
}


/* *********************** */
/* SCROLL WITH MOUSE-WHEEL */
/* *********************** */
function scroll(section) {
	(function () {
		function scrollHorizontally(e) {
			e = window.event || e;
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			// larghezza width = 260px + 10 padding
			const width = 270;
			section.scrollLeft -= (delta * width);
			e.preventDefault();
		}
		if (section.addEventListener) {
			// IE9, Chrome, Safari, Opera
			section.addEventListener('mousewheel', scrollHorizontally, false);
			// Firefox
			section.addEventListener('DOMMouseScroll', scrollHorizontally, false);
		} else {
			// IE 6/7/8
			section.attachEvent('onmousewheel', scrollHorizontally);
		}
	})();
}
/* *********************** */
/* *********************** */
/* CREAZIONE pulsanti scroll */
function createScrollButtons(section) {
	$(`#${section}-list`).append(`<div class="scroll-left scroll">
	<i class="fas fa-chevron-left"></i>
	<i class="fas fa-chevron-left"></i>
	</div>
	<div class="scroll-right scroll" >
	<i class="fas fa-chevron-right"></i>
	<i class="fas fa-chevron-right"></i>
	</div>`);
}

/* FUNZIONE pulsanti scroll */
function scrollButtonMovie() {
	let width = $(this).parent().width();
	if (this.className == 'scroll-left scroll') {
		$(this).parent()[0].scrollLeft -= (width);
	} else {
		$(this).parent()[0].scrollLeft += (width);
	}
}