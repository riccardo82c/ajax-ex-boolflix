/* 
Milestone 1:
	Creare un layout base con una searchbar(una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film.
	Possiamo, cliccando il bottone, cercare sull’ API tutti i film che contengono ciò che ha scritto l’ utente.
	Vogliamo dopo la risposta dell’ API visualizzare a schermo i seguenti valori per ogni film trovato:
	Titolo
	Titolo Originale
	Lingua
	Voto
 */


$(function () {

	$('#input').keypress(function (e) {
		if (e.which == 13) {
			retrieveString();
		}
	});

	$("#search-btn").click(function () {
		retrieveString();

	});

	/* funzione */
	function retrieveString() {
		$('#list').empty();
		let str = $("#input").val();
		$("#input").val('');

		$.ajax({
			method: 'GET',
			url: 'https://api.themoviedb.org/3/search/movie',
			data: {
				api_key: '5735ba8aa714f2161c6a9f7f267223ef',
				language: 'it-IT',
				query: str,
			},
			success: function (obj) {

				var source = $("#entry-template").html();
				var template = Handlebars.compile(source);

				if (obj.results.length > 0) {

					for (let i = 0; i < obj.results.length; i++) {

						let hbObj = {
							title: obj.results[i].title,
							original_title: obj.results[i].original_title,
							original_language: obj.results[i].original_language,
							vote_average: obj.results[i].vote_average
						}

						var html = template(hbObj);
						$('#list').append(html);
					}
				} else {
					$('#list').append('il titolo ricercato non esiste');
				}

			},
			error: function () {
				alert('Errore');

			}
		});




	}








});