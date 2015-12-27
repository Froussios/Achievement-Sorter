// ==UserScript==
// @match http://steamcommunity.com/profiles/*/stats/*?tab=achievements*
// ==/UserScript==

$("body").append('<div class="custom_filter"></div>');
var bar = $(".custom_filter");
bar.css("position", "fixed");
bar.css("height", "50px");
bar.css("width", "400px");
bar.css("top", "0px");
bar.css("right", "0px");
bar.css("background-color", "red")
bar.css("z-index", "1000")

alert("hi1")