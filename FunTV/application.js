//# sourceURL=application.js

/*
 application.js
 FunTV
 
 Copyright (c) 2017 SII. All rights reserved.
*/

var baseURL;

var selectedItem;

var product = "Products";

function displayLoadingTemplate() {
	navigationDocument.pushDocument(loadingTemplate());
}


function displayAlertTemplate(title, description) {
	navigationDocument.pushDocument(alertTemplate(title, description));
}

function testXml() {
    console.log("IN THERE");
}


function getDocument(extension) {
    console.log("CECI EST UN TEST'" + extension);
	var templateXHR = new XMLHttpRequest();
	var url = baseURL + extension;
console.log("getDocument: " + url);
	displayLoadingTemplate();
	templateXHR.responseType = "document";
	templateXHR.addEventListener("load", function() {pushPage(templateXHR.responseXML);}, false);
	templateXHR.open("GET", url, true);
	templateXHR.send();
    
}

function parseJson(information) {
    print("in parseJSON");
	var result = JSON.parse(information);

	var movies ="";
	for(i = 0; i < result.length; i++) {
		movies += `
		<lockup>
			<img src="` + baseURL + result[i].url + `" width="182" height="274" />
			<title>` + result[i].title +`</title>
		</lockup>`;
	}
	var template = `
		<document>
			<stackTemplate>
				<banner>
					<title>JSON Shelf</title>
				</banner>
				<collectionList>
					<shelf>
						<section>` + movies + `</section>
					</shelf>
				</collectionList>
			</stackTemplate>
		</document>`;
	var templateParser = new DOMParser();
	var parsedTemplate = templateParser.parseFromString(template, "application/xml");
	navigationDocument.pushDocument(parsedTemplate);
}

function getMedia(extension, mediaType, overlayURL) {
	if (overlayURL != null) {
//		console.log("not null");
		var templateXHR = new XMLHttpRequest();
		var url = baseURL + overlayURL;

		templateXHR.responseType = "document";
		templateXHR.addEventListener("load", function() {playMedia(extension, mediaType, templateXHR.responseXML);}, false);
		templateXHR.open("GET", url, true);
		templateXHR.send();
	} else {
//		console.log("null");
		playMedia(extension, mediaType, null);
	}
}

function loadAndPushDocument(url) {
	var loadingDocument = loadingTemplate();
	navigationDocument.pushDocument(loadingDocument);
//	displayLoadingTemplate();
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
 
	request.onreadystatechange = function() {
		if (request.readyState != 4) {
			return;
		}

		if (request.status == 200) {
			var document = request.responseXML;
			navigationDocument.replaceDocument(document, loadingDocument)
			search(document);
		}
		else {
			navigationDocument.popDocument();
			var alertDocument = alertTemplate();
			navigationDocument.presentModal(alertDocument);
		}
	};
	request.send();
}

function pushPage(document) {
	var currentDoc = getActiveDocument();
	if (currentDoc.getElementsByTagName("loadingTemplate").item(0) == null) {
//		console.log("no loading");
		navigationDocument.pushDocument(document);
	} else {
		navigationDocument.replaceDocument(document, currentDoc);
//		console.log("loading");
	}
}

function playMedia(extension, mediaType, overlayDoc) {
	var videourl = baseURL + extension;
	var singleVideo = new MediaItem(mediaType, videourl);
	var videoList = new Playlist();
	videoList.push(singleVideo);
	var myPlayer = new Player();
	myPlayer.playlist = videoList;
	myPlayer.overlayDocument = overlayDoc;
	myPlayer.play();
}

function search(document) {
	var searchField = document.getElementsByTagName("searchField").item(0);
	var keyboard = searchField.getFeature("Keyboard");

	keyboard.onTextChange = function() {
		var searchText = keyboard.text;
		console.log("Search text changed " + searchText);
		searchResults(document, searchText);
	}

	keyboard.onWillTerminate = function() {
		console.log("Search will terminate");
	}

	keyboard.onExit = function() {
		console.log("Search exit");
	}

	keyboard.onWillResignActive = function() {
		console.log("Search will resign active");
	}
}

function searchResults(doc, searchText) {
	var regExp = new RegExp(searchText, "i");
	var matchesText = function(value) {
		return regExp.test(value);
	}

	var movies = {
		"Surf": 1,
		"Sand": 2,
		"Fun": 3,
		"Stuff": 4,
	};
	var titles = Object.keys(movies);
	console.log(titles);

	var domImplementation = doc.implementation;
	var lsParser = domImplementation.createLSParser(1, null);
	var lsInput = domImplementation.createLSInput();

	lsInput.stringData = `
		<list>
			<section>
				<header>
					<title>No Results</title>
				</header>
			</section>
		</list>`;

	titles = (searchText) ? titles.filter(matchesText) : titles;

	if (titles.length > 0) {
		lsInput.stringData = `<shelf><header><title>Results</title></header><section id="Results">`;
		for (var i = 0; i < titles.length; i++) {
			lsInput.stringData += `<lockup><img src="Enter path to images/images/Beach_Movie_HiRes/Beach_Movie_250x375_A.png" width="182" height="274" /><title>${titles[i]}</title></lockup>`;
		}
		lsInput.stringData += `</section></shelf>`;
	}

	lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
}

App.onLaunch = function(options) {
	baseURL = options.BASEURL;
//	var extension = "templates/stackTemplate.xml";
//	var extension = "templates/searchTemplate.xml";
//	var extension = "templates/stuffTemplate.xml";
	var extension = "templates/showcaseTemplate.xml";
	getDocument(extension);
}

App.onExit = function() {
	console.log("exited");
}

App.onWillResignActive = function() {

}

App.onDidEnterBackground = function() {

}

App.onWillEnterForeground = function() {
	
}

App.onDidBecomeActive = function() {
    
}

App.onWillTerminate = function() {
    
}


/**
 * This convenience functions returns templates, which can be used to present info or errors to the user
 */
var alertTemplate = function(title, description) {
	var templateString = `<?xml version="1.0" encoding="UTF-8" ?>
		<document>
			<alertTemplate>
				<title>${title}</title>
				<description>${description}</description>
			</alertTemplate>
		</document>`;
	var templateParser = new DOMParser();
	var templateDoc = templateParser.parseFromString(templateString, "application/xml");
	return templateDoc;
}

var loadingTemplate = function () {
	var templateString = `
		<document>
			<loadingTemplate>
				<activityIndicator>
					<text>Loading</text>
				</activityIndicator>
			</loadingTemplate>
		</document>`;
	var templateParser = new DOMParser();
	var templateDoc = templateParser.parseFromString(templateString, "application/xml");
	return templateDoc;
}
