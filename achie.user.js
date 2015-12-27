// ==UserScript==
// @match http://steamcommunity.com/profiles/*/stats/*?tab=achievements*
// ==/UserScript==

// Case-insensitive contains for jQuery
$.extend($.expr[":"], {
	"containsNC": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
	}
});

var termsInput = $(
	"<div id='searchContainer'>" +
		"<input id='terms' class='search' type='text' placeholder='search terms'/>" +
	"</div>"
);

$("#topSummaryBoxContent").append(termsInput);



var all = $(".achieveRow");

// Respond to terms
$("#terms").keyupAsObservable()
	.map(_ => $("#terms").val())
	.debounce(200)
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

