
var DBpedia = {};
DBpedia.getDataDbPedia = function(TitreChanson, type, callback) {

	var query  = encodeURIComponent(
	'SELECT * WHERE { '+
	'<http://fr.dbpedia.org/resource/' + TitreChanson +'> '+
	type+' ?i .' +
	'FILTER langMatches( lang(?i), "FR" )	}');

	var url = 'http://fr.dbpedia.org/sparql?default-graph-uri=&query=' +query+ '&format=json'

	$.get(url, function(data){
    if(data.results.bindings.length > 0)
  		if(data.results.bindings[0].i) {
  			var value = data.results.bindings[0].i.value;
  			callback(value);
  		}
	});
}

DBpedia.getDataDbPediaWithoutFilter = function(TitreChanson, type, callback) {

	var query  = encodeURIComponent(
	'SELECT * WHERE { '+
	'<http://fr.dbpedia.org/resource/' + TitreChanson +'> '+
	type+' ?i }');

	var url = 'http://fr.dbpedia.org/sparql?default-graph-uri=&query=' +query+ '&format=json'

	$.get(url, function(data){
    if(data.results.bindings.length > 0)
  		if(data.results.bindings[0].i) {
  			var value = data.results.bindings[0].i.value;
  			callback(value);
  		}
	});
}

DBpedia.getAbstract = function(music, callback) {
	DBpedia.getDataDbPedia(music, '<http://dbpedia.org/ontology/abstract>', callback);
}

DBpedia.getTitle = function(music, callback) {
	DBpedia.getDataDbPedia(music, '<http://fr.dbpedia.org/property/titre>', callback);
}

DBpedia.getDateSortie = function(music, callback) {
	DBpedia.getDataDbPedia(music, '<http://fr.dbpedia.org/property/sorti>', callback);
}

DBpedia.getPictureURL = function(music, callback) {
	DBpedia.getDataDbPediaWithoutFilter(music, '<http://dbpedia.org/ontology/thumbnail>', callback);
}

DBpedia.getWikipediaPage = function(music, callback) {
	DBpedia.getDataDbPediaWithoutFilter(music, '<http://xmlns.com/foaf/0.1/isPrimaryTopicOf>', callback);
}