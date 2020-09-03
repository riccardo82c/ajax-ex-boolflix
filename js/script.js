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



	/* FUNZIONI */
	// chiamata AJAX per restituire la stringa
	function findCollection() {
		// setto a vuoto il placeholder prima della query ajax
		$('#input').attr('placeholder', '');
		// salvo in una variabile il campo preso da #input e resetto
		let query = saveAndReset();
		// chiamata AJAX
		ajaxCall(query, 'movie');
		ajaxCall(query, 'tv');
	}


	// resetto il DOM, SALVO valore di input e svuoto input 
	function saveAndReset() {
		$('#list').empty();
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
					/* posso sennò aggiungere una funzione no result */
					// se nn ci sono titoli 
					$('#list').append(`<p>Il titolo ricercato non esiste in ${type}</p>`);
					$('#input').attr('placeholder', 'Sorry, no result');

				}
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

			let titolo, titoloOriginale;

			if (type == 'movie') {
				titolo = 'title';
				titoloOriginale = 'original_title';
			} else if (type == 'tv') {
				titolo = 'name';
				titoloOriginale = 'original_name';
			} else {
				alert('errore scelta tipo');
			}

			let hbObj = {
				title: data.results[i][titolo],
				original_title: data.results[i][titoloOriginale],
				original_language: langFlags(data.results[i].original_language),
				vote_average: star(data.results[i].vote_average),
				tipo: type
			}

			var html = template(hbObj);
			$('#list').append(html);

			// setto il placeholder
			$('#input').attr('placeholder', 'Insert Title');
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
	function langFlags(str) {
		// se la stringa è presente restituisco l'immagine sennò la stringa stessa
		if (str === 'en' || str === 'it' || str === 'fr' || str === 'de' || str === 'es' || str === 'ja') {
			return `img/${str}.png`;
		} else {
			return str
		}
	}
});


/* 
switch (str) {


	case 'en':
		return ('img/en.png');
	case 'it':
		return ('img/it.png');
	case 'fr':
		return ('img/fr.png');
	case 'de':
		return ('img/de.png');
	case 'es':
		return ('img/es.png');
	case 'ja':
		return ('img/ja.png');
	default:
		return str
} */