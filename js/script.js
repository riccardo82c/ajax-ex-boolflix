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
 */


$(function () {

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

});



/* FUNZIONI */
// chiamata AJAX per restituire la stringa
function findCollection() {
	// setto a vuoto il placeholder prima della query ajax
	/* $('#input').attr('placeholder', ''); */
	// salvo in una variabile il campo preso da #input e resetto
	let query = saveAndReset();
	// chiamata AJAX
	ajaxCall(query, 'movie');
	ajaxCall(query, 'tv');
}


// resetto il DOM, SALVO valore di input e svuoto input 
function saveAndReset() {
	$('#tv-list').empty();
	$('#movie-list').empty();
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
				printCollection(obj, type);

			} else {

				noResult(type);
			}


			// ricerca genere film

		},
		error: function () {
			alert('Errore');
		}
	});
}


// inserisco i movie nel DOM
function printCollection(data, type) {
	/* tutto questo posso metterlo in una funzione esterna */
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
			overview: thisItem.overview.substring(0, 100) + '...',
		}

		console.log(thisItem.id);

		var html = template(hbObj);
		location.append(html);

		// check del genere
		// NO RETURN FUNCTION
		ajaxGenre(type, thisItem.genre_ids[0], thisItem.id);



		// setto il placeholder
		$('#input').attr('placeholder', 'Inserisci titolo');
	}
}

// funzione per convertire il numero in stelle
function star(int) {
	int = Math.round(int / 2);
	const starFull = '<i class="fas fa-star"></i>';
	const starEmpty = '<i class="far fa-star"></i>';
	let result = starFull.repeat(int) + starEmpty.repeat(5 - int);
	return result;
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

// verifico se esiste qualche item
function noResult(tipo) {
	let location;
	tipo == 'movie' ? location = $('#movie-list') : location = $('#tv-list')
	console.log('niente da visualizzare');
	location.append(`<p>Il titolo ricercato non esiste in ${tipo} </p>`);
	/* $('#input').attr('placeholder', `No ${tipo} result`); */
}

// check se presente l'immagine nel db
function checkImage(path) {
	const defaultImg = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FsvTVRDgI08Y%2Fmaxresdefault.jpg&f=1&nofb=1';
	return path == null ? defaultImg : `https://image.tmdb.org/t/p/w342${path}`
}

// check tipe
function checkType(genre) {
	return genre == 'movie' ? 'Film' : 'Serie TV'
}

// matchin del genere del film con l'array dei generi
function ajaxGenre(type, int, idMovie) {
	$.ajax({
		method: 'GET',
		url: `https://api.themoviedb.org/3/genre/${type}/list?api_key=5735ba8aa714f2161c6a9f7f267223ef&language=it-IT`,
		data: {
			api_key: '5735ba8aa714f2161c6a9f7f267223ef',
			language: 'it-IT'
		},
		success: function (obj) {
			/* console.log(checkArray(obj.genres, int)); */
			console.log($(`.item[data-id="${idMovie}"`));

			/* $(`.genere[data-id="${idMovie}"`).append(checkArray(obj.genres, int)); */
			$(`.item[data-id="${idMovie}"`).find('.genere').append(checkArray(obj.genres, int));
		},
		error: function () {
			alert('Errore');
		}
	});
}

function checkArray(arr, int) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].id == int) {
			return arr[i].name
		}
	}
}





/* const credit = {
	"id": 24428,
	"cast": [{
			"cast_id": 46,
			"character": "Tony Stark / Iron Man",
			"credit_id": "52fe4495c3a368484e02b251",
			"gender": 2,
			"id": 3223,
			"name": "Robert Downey Jr.",
			"order": 0,
			"profile_path": "/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg"
		},
		{
			"cast_id": 2,
			"character": "Steve Rogers / Captain America",
			"credit_id": "52fe4495c3a368484e02b19b",
			"gender": 2,
			"id": 16828,
			"name": "Chris Evans",
			"order": 1,
			"profile_path": "/bOH7QqvC9FShVMzWH2wBTtb2iwX.jpg"
		},
		{
			"cast_id": 307,
			"character": "Bruce Banner / The Hulk",
			"credit_id": "5e85e8083344c60015411cfa",
			"gender": 2,
			"id": 103,
			"name": "Mark Ruffalo",
			"order": 2,
			"profile_path": "/z3dvKqMNDQWk3QLxzumloQVR0pv.jpg"
		}
	]
}


const movie = [{
		"popularity": 51.055,
		"id": 603,
		"video": false,
		"vote_count": 17670,
		"vote_average": 8.1,
		"title": "The Matrix",
		"release_date": "1999-03-30",
		"original_language": "en",
		"original_title": "The Matrix",
		"genre_ids": [
			28,
			878
		],
		"backdrop_path": "/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
		"adult": false,
		"overview": "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
		"poster_path": "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg"
	},
	{
		"popularity": 35.63,
		"id": 604,
		"video": false,
		"vote_count": 7120,
		"vote_average": 6.9,
		"title": "The Matrix Reloaded",
		"release_date": "2003-05-15",
		"original_language": "en",
		"original_title": "The Matrix Reloaded",
		"genre_ids": [
			12,
			28,
			53,
			878
		],
		"backdrop_path": "/sDxCd4nt3eR4qOCW1GoD0RabQtq.jpg",
		"adult": false,
		"overview": "Six months after the events depicted in The Matrix, Neo has proved to be a good omen for the free humans, as more and more humans are being freed from the matrix and brought to Zion, the one and only stronghold of the Resistance.  Neo himself has discovered his superpowers including super speed, ability to see the codes of the things inside the matrix and a certain degree of pre-cognition. But a nasty piece of news hits the human resistance: 250,000 machine sentinels are digging to Zion and would reach them in 72 hours. As Zion prepares for the ultimate war, Neo, Morpheus and Trinity are advised by the Oracle to find the Keymaker who would help them reach the Source.  Meanwhile Neo's recurrent dreams depicting Trinity's death have got him worried and as if it was not enough, Agent Smith has somehow escaped deletion, has become more powerful than before and has fixed Neo as his next target.",
		"poster_path": "/jBegA6V243J6HUnpcOILsRvBnGb.jpg"
	}
]; */