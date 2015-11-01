var wikiArticleLink = "http://en.wikipedia.org/wiki/Invasion_of_Normandy";
var handleData = function handleData(data){

	console.log(data.summary);
	console.log(data.summary.title);

	$("#title").html($("#title").html() + "" + data.summary.title);

	console.log(data.summary.summary);
	$("#summary").html($("#summary").html() + "" + data.summary.summary.substring(0,275) + "...");	

	
	console.log(data.summary.image);
	//$("#image").html($("#image").html() + "" + data.summary.image);
	$("#put-image-here").attr("src", imageLink(data));
	$("#image-link").attr("href", wikiArticleLink);
}

function imageLink(data){
	return data.summary.image;
}

var handleError = function handleError(error){
	console.log(error);
}

var info = WIKIPEDIA.getData(wikiArticleLink, handleData, handleError);