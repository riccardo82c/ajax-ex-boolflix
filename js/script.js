$(function () {



	$('#input').keypress(function (e) {
		if (e.which == 13) {
			$('#list').empty();
			let title = $("#input").val();
			retrieveString(title);
			$("#input").val('');
		}
	});



	$("#search-btn").click(function () {
		$('#list').empty();
		let title = $("#input").val();
		retrieveString(title);
		$("#input").val('');
	});

	/* funzione */

	function retrieveString(str) {

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


				for (let i = 0; i < obj.results.length; i++) {

					let hbObj = {
						title: obj.results[i].title,
						original_title: obj.results[i].original_title,
						original_language: obj.results[i].original_language,
						vote_average: obj.results[i].vote_average
					}
					console.log(hbObj);
					var html = template(hbObj);
					$('#list').append(html);
				}

			},
			error: function () {

			}
		});




	}








});