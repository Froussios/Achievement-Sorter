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
		"<input id='terms' class='search' type='text' placeholder='search terms'/> " +
		"<input id='hideunlocked' type='checkbox'>hide unlocked</input> " +
		"<button id='sortbydate' type'button'>Sort by date</button> " +
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

$("#sortbydate").clickAsObservable()
	.subscribe(_ => {
		insertionsort(unlocked.toArray(), compare);
		unlocked = $(".achieveRow:has(.achieveUnlockTime:contains('Unlocked'))," + 
                 ".achieveRow.unlocked");
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
	var date1 = getDate(item1);
	var date2 = getDate(item2);
	
	var v1 = date1.split(" ");
	var v2 = date2.split(" ");
	if (v1.length != v2.length)
		return v2.length - v1.length;
	
	v1 = order(date1);
	v2 = order(date2);
	for (var i=0 ; i<v1.length ; i++) {
		if (v1 < v2)
			return -1;
		if (v1 > v2)
			return 1;
	}
	return 0;
}

var months = {
	1: "Jan",
	2: "Feb",
	3: "Mar",
	4: "Apr",
	5: "May",
	6: "Jun",
	7: "Jul",
	8: "Aug",
	9: "Sep",
	10: "Oct",
	11: "Nov",
	12: "Dec",
	
	"Jan": 1,
	"Feb": 2,
	"Mar": 3,
	"Apr": 4,
	"May": 5,
	"Jun": 6,
	"Jul": 7,
	"Aug": 8,
	"Sep": 9,
	"Oct": 10,
	"Nov": 11,
	"Dec": 12
}

function order(date) {
	var day = /\d\d/i.exec(date);
	var time = /\d+:\d\d/i.exec(date);
	var month = /\w\w\w,/i.exec(date);
	var year = /\d\d\d\d/i.exec(date);
	var now = new Date();
	return [
		year != null  ? year[0] 
		              : now.getYear(),
		month != null ? months[month[0]] 
		              : months[now.getMonth()+1],
		day != null   ? day[0] 
		              : now.getDate(),
		time != null  ? time[0] 
		              : "" + now.getHours() + ":" + now.getMinutes(),
	];
}

function rearrange(items, indices) {
	var rv = Array();
	for (var i=0 ; i<indices.length ; i++) {
		rv[i] = items[indices[i]];
	}
	return rv;
}

