
function getDataDbPedia(TitreChanson, type, callback) {

	var query  = encodeURIComponent(
	'SELECT * WHERE { '+
	'<http://fr.dbpedia.org/resource/' + TitreChanson +'> '+
	type+' ?i .' +
	'FILTER langMatches( lang(?i), "FR" )	}');

	var url = 'http://fr.dbpedia.org/sparql?default-graph-uri=&query=' +query+ '&format=json'

	$.get(url, function(data){
		var value = data.results.bindings[0].i.value;
		callback(value);
	});
}

function getAbstractAmy() {
	getAbstract('Rehab_(chanson_d\'Amy_Winehouse)', 'abstract');
}

function getAbstractSmoke() {
	getAbstract('Smoke_on_the_Water', '<http://dbpedia.org/ontology/abstract>');
	getAbstract('Smoke_on_the_Water', '<http://fr.dbpedia.org/property/titre>');
}

function getAbstract(music, callback) {
	getDataDbPedia(music, '<http://dbpedia.org/ontology/abstract>', callback);
}

function getTitle(music, callback) {
	getDataDbPedia(music, '<http://fr.dbpedia.org/property/titre>', callback);
}

function getDateSortie(music) {
	getDataDbPedia(music, '<http://fr.dbpedia.org/property/sorti>');
}