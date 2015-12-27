// ==UserScript==
// @match http://steamcommunity.com/profiles/*/stats/*?tab=achievements*
// ==/UserScript==

// Case-insensitive contains for jQuery
$.extend($.expr[":"], {
	"containsNC": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
	}
});

// Add search controls
$("body").append(
	'<div class="filter_bar">' +
		"<div class='version_holder'>" +
			chrome.runtime.getManifest().version + 
		"</div>" +
		"<div>" +
			"<input id='terms' class='search' type='text'/>" +
		"</div>" +
	'</div>'
);

var all = $(".achieveRow");

// Respond to terms
$("#terms").keyupAsObservable()
	.map(_ => $("#terms").val())
	.throttle(200)
	.distinctUntilChanged()
	.subscribe(termstr => {
		var orTerms = termstr.split(";").map(s => s.trim());
		
		// remove previous filter
		all.removeClass("match");
		all.addClass("excluded");
		
		// apply filtering
		orTerms.forEach(term => {
			var andTerms = term.split("+").map(s => s.trim());
			var condition = andTerms.reduce((a,t) => a + ":containsNC(" + t + ")", "");
			var matches = $(".achieveRow" + condition);
			matches.addClass("match");
			matches.removeClass("excluded");
		});
	});

