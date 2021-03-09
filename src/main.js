// jshint esversion: 6
function onCreated(tab) { console.log(`Created new tab: ${tab.id}`); }
function onError(error) { console.log(`Error: ${error}`); }
browser.browserAction.onClicked.addListener(function() {
	var creating = browser.tabs.create({
		url:"./weasel.html"
	});
	creating.then(onCreated, onError);
});
