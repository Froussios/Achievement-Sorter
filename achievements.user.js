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

function insertionsort(items, comparator) {
	for (var i=0 ; i<items.length ; i++) {
		for (var j=i+1 ; j<items.length ; j++) {
			if (comparator(items[i], items[j]) < 0) {
				// put j before i
				$(items[i]).before($(items[j]));
				// modifiy array accordingly
				items.splice(i, 0, items[j]);
				items.splice(j+1, 1);
			}
		}
	}
}

function getDate(item) {
	return $(item).find(".achieveUnlockTime").text().trim('"');
}

// TODO better than lexicographical
function compare(item1, item2) {
	if (getDate(item1) < getDate(item2))
		return -1;
	if (getDate(item1) > getDate(item2))
		return 1;
	return 0;
}

