var OMDbAPIKEY = "63a3d5a2";	//PROVIDE THE ACQUIRED OMDb API KEY

async function performQuery() {	
	document.getElementById('movie_title_area').innerHTML = '';
	document.getElementById('main_info_area').innerHTML = '';
	document.getElementById('poster_area').innerHTML = '';
	document.getElementById('extra_info_area').innerHTML = '';
	document.getElementById("info_query").innerHTML = '';

	var userInput = document.getElementById("search_bar");

	var query = userInput.value;
	if(query.length > 0){
		await debouncedHandler(query);
	}else{
		if(typeof document.getElementById("movie_title_area").innerHTML != "undefined" && document.getElementById("movie_title_area").innerHTML != ''){
			document.getElementById("movie_title_area").innerHTML = 'Movie not found!';
		}
	}
}

var debouncedHandler = _.debounce(createEntireList, 500);

async function createEntireList(query){
	var response = await fetch("http://www.omdbapi.com/?s=" + encodeURI(query) + "&apikey=" + OMDbAPIKEY);
	
	var data = await response.json();
	
	document.getElementById("results_list").innerHTML = '';

	var moviesArray = [];
	moviesArray = data.Search;
	if (typeof moviesArray != "undefined") {
		var moviesArrayLength = moviesArray.length;

		document.getElementById("info_query").innerHTML = moviesArrayLength + ' results for \"' + query + '\"';
	} else {
		document.getElementById("movie_title_area").innerHTML = "Movie not found!";
		return;
	}
	
	var i;
	var moviesObjects = [];
	for (i = 0; i < moviesArrayLength; i++) {
		moviesObjects.push(moviesArray[i]);
	}

	var titleLink = '';
	var titleLinkText = '';
	var title = '';
	var poster_img = '';
	var poster_url = '';
	var list = ' ';
	for (i = 0; i < moviesObjects.length; i++) {

		titleLink = document.createElement('a');
		for (property in moviesObjects[i]) {
			if(property === 'Title'){
				title = (moviesObjects[i])[property];
			}else if (property !== 'Poster' && property !== 'imdbID') {
				list += (moviesObjects[i])[property] + ' | ';
			} else if(property === 'Poster'){
				
				poster_img = document.createElement('img');
				poster_url = (moviesObjects[i])[property];
				if(poster_url !== 'N/A'){
					poster_img.src = poster_url;
				}else{
					poster_img.src = 'images/image_not_found.png'
				}
			}
		}
		list = list.substring(0, list.length - 2);

		titleLinkText = document.createTextNode(title);
		titleLink.appendChild(titleLinkText);
		titleLink.title = title;
		
		list += '\n'; 

		var poster_img_link = document.createElement('a');
		poster_img.setAttribute('class', title);
		poster_img_link.setAttribute('href', 'movie.html?'+title);
		poster_img_link.append(poster_img);

		document.getElementById("results_list").append(poster_img_link);

		var movie_info_link = document.createElement('a');
		
		movie_info_link.setAttribute('class', title);
		movie_info_link.setAttribute('href', 'movie.html?'+title);
		movie_info_link.append(title);

		document.getElementById("results_list").append(' ');
		document.getElementById("results_list").append(movie_info_link);
		document.getElementById("results_list").append(' |' + list);
		document.getElementById("results_list").append('\n');
		
		list = ' ';

	}
}

async function handleMoviePageReload(query) {
    document.getElementById("info_query").innerHTML = '';

    document.getElementById("results_list").innerHTML = '';
	
	var response = await fetch("http://www.omdbapi.com/?apikey=" + OMDbAPIKEY + "&t=" + encodeURI(query));
	
	var data = await response.json();
	
	refreshResponse(data);	
}

function refreshResponse(response) {
    var imdbRating = '';
    var imdbVotes = '';
    var response_main_info = '';
    var metadata = '';
	var url_info = '';
	var url = document.createElement('a');
    var exists = response.Response;
    if (exists === "True") {
        for (property in response) {
            if (property === 'Title') {
                var title = response[property];
            } else if (property === 'Poster') {
                document.getElementById("poster_area").innerHTML = "";
                var poster_img = document.createElement('img');
                var poster_url = response[property];
                if(poster_url !== 'N/A'){
                    poster_img.src = poster_url;
                }else{
                    poster_img.src = 'images/no_image_available.png'
                }
            } else if (property === 'Plot') {
                var description = property + ": " + response[property];
            } else if (property === 'imdbRating'){
                imdbRating = response[property];
            } else if (property === 'imdbVotes') {
                imdbVotes = response[property];
            }else if (property === 'Rated' || property === 'Runtime' || property === 'Genre' || property === 'Country' || property === 'Released') {
                response_main_info = response_main_info + response[property] + ' | ';
            }else if (property === 'Website'){
				url.setAttribute('href', response[property]);
                url_info = property + ": ";
				urlText = document.createTextNode(response[property]);
				url.appendChild(urlText);
			}
			else if(property !== 'Response') {
                if(property === 'Ratings'){
                    var ratingsElements = '';
                    for(ratingsElement of response[property] ){
                        ratingsElements += ratingsElement.Source + ' -> ' + ratingsElement.Value + ', ';
                    }
                    ratingsElements = ratingsElements.substring(0, ratingsElements.length - 2);
                    metadata = metadata + property + ": " + ratingsElements + '\n';
                }else{
                    metadata = metadata + property + ": " + response[property] + '\n';
                }
            } 
        }

        response_main_info = "IMDb Rating: " + imdbRating + "/10 out of " + imdbVotes + " votes | " + response_main_info;
        response_main_info = response_main_info.substring(0, response_main_info.length - 2);

        var response_extra_info = description + '\n' + metadata + url_info;
		
        printResponse(title, response_main_info, response_extra_info, url_info, url, poster_img);
    } else {
        document.getElementById("movie_title_area").innerHTML = "Movie not found!";
        document.getElementById("main_info_area").innerHTML = "";
        document.getElementById("poster_area").innerHTML = "";
        document.getElementById("extra_info_area").innerHTML = "";
    }
    
}

function printResponse(title, response_main_info, response_extra_info, url_info, url, poster_img) {
    document.getElementById("movie_title_area").innerHTML = title;
    document.getElementById("main_info_area").innerHTML = response_main_info;
    document.getElementById("poster_area").appendChild(poster_img);
    document.getElementById("extra_info_area").innerHTML = response_extra_info; 
    document.getElementById("extra_info_area").appendChild(url); 
}

async function moviePageOnLoad(){
    var movie_asked = decodeURIComponent(window.location.search).substring(1);
	
    var string_array = movie_asked.split('%20');
    var query = string_array[0];
	
	if(typeof query != "undefined" && query.length > 0) await handleMoviePageReload(query);
}