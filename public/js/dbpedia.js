
function getDataDbPedia(TitreChanson, type, callback) {

	var query  = encodeURIComponent(
	'SELECT * WHERE { '+
	'<http://fr.dbpedia.org/resource/' + TitreChanson +'> '+
	type+' ?i .' +
	'FILTER langMatches( lang(?i), "FR" )	}');

	var url = 'http://fr.dbpedia.org/sparql?default-graph-uri=&query=' +query+ '&format=json'

	$.get(url, function(data){
		if(data.results.bindings[0].i) {
			var value = data.results.bindings[0].i.value;
			callback(value);
		}
	});
}

function getDataDbPediaWithoutFilter(TitreChanson, type, callback) {

	var query  = encodeURIComponent(
	'SELECT * WHERE { '+
	'<http://fr.dbpedia.org/resource/' + TitreChanson +'> '+
	type+' ?i }');

	var url = 'http://fr.dbpedia.org/sparql?default-graph-uri=&query=' +query+ '&format=json'

	$.get(url, function(data){
		if(data.results.bindings[0].i) {
			var value = data.results.bindings[0].i.value;
			callback(value);
		}
	});
}

function getAbstract(music, callback) {
	getDataDbPedia(music, '<http://dbpedia.org/ontology/abstract>', callback);
}

function getTitle(music, callback) {
	getDataDbPedia(music, '<http://fr.dbpedia.org/property/titre>', callback);
}

function getDateSortie(music, callback) {
	getDataDbPedia(music, '<http://fr.dbpedia.org/property/sorti>', callback);
}

function getPictureURL(music, callback) {
	getDataDbPediaWithoutFilter(music, '<http://dbpedia.org/ontology/thumbnail>', callback);
}

function getWikipediaPage(music, callback) {
	getDataDbPediaWithoutFilter(music, '<http://xmlns.com/foaf/0.1/isPrimaryTopicOf>', callback);
}