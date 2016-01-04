// ==UserScript==
// @match http://steamcommunity.com/profiles/*/stats/*?tab=achievements*
// @author Froussios
// ==/UserScript==

// Case-insensitive contains for jQuery
$.extend($.expr[":"], {
	"containsNC": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
	}
});

// Controls
var termsInput = $(
	"<div id='searchContainer'>" +
		"<input id='terms' class='search' type='text' placeholder='search terms'/>" +
		"<input id='hideunlocked' type='checkbox'>hide unlocked</input>" +
	"</div>"
);
// Inject controls into webpage
$("#topSummaryBoxContent, #headerContent").append(termsInput);

var all = $(".achieveRow");
var unlocked = $(".achieveRow:has(.achieveUnlockTime:contains('Unlocked'))," + 
                 ".achieveRow.unlocked");

// Respond to terms
$("#terms").keyupAsObservable()
	.map(_ => $("#terms").val())
	.debounce(200)
	.distinctUntilChanged()
	.subscribe(termstr => {
		// remove previous filter
		all.removeClass("match");
		all.addClass("excluded");
		// apply filtering
		var orTerms = termstr.split(";").map(s => s.trim()).filter(s => s.length!=0);
		orTerms.forEach(term => {
			var andTerms = term.split("+").map(s => s.trim());
			var condition = andTerms.reduce((a,t) => a + ":containsNC(" + t + ")", "");
			var matches = $(".achieveRow" + condition);
			matches.addClass("match");
			matches.removeClass("excluded");
		});
	});

// Hide/unhide unlocked
$("#hideunlocked").changeAsObservable()
	.map(_ => $("#hideunlocked").prop("checked"))
	.subscribe(checked => {
		if (checked)
			unlocked.addClass("hiddenUnlocked");
		else
			unlocked.removeClass("hiddenUnlocked");
	});

