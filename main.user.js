/*
 *	Userscript that allows ICCup admins to generate commands for tournaments
 *	Copyright (C) 2015  xboi209 (xboi209@gmail.com)
 *	
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *	
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *	
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// ==UserScript==
// @name			ICCup StarCraft Tournament Command Generator
// @description		Allows admins to generate commands on tournament grid pages   
// @author			xboi209 (xboi209@gmail.com) 
// @license			GNU General Public License v3 (http://www.gnu.org/licenses/gpl-3.0.en.html) 
// @version			1.1
// @match			http://iccup.com/en/starcraft/tourney/grid/*.html
// @match			http://iccup.com/starcraft/tourney/grid/*.html
// @grant			none
// ==/UserScript==


function addJQuery(callback) {
	var script = document.createElement("script");
	script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js");
	script.addEventListener('load', function() {
		var script = document.createElement("script");
		script.textContent = "window.jQuery=jQuery.noConflict(true);(" + callback.toString() + ")();";
		document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
}

function main()
{
	function formatNum(num)
	{
		if (jQuery.isNumeric(num) == false)
			return "";

		var numberStr;
		if (num == 1)
		{
			numberStr = "1st";
		}
		else if (num == 2)
		{
			numberStr = "2nd";
		}
		else if (num == 3)
		{
			numberStr = "3rd";
		}
		else
		{
			numberStr = num + "th";
		}
		
		return numberStr;
	}

	var grid = jQuery("#t1x1");
	if (grid.length == 0)
		return; //2x2 tournaments aren't supported yet
	
	var numRounds;
	if (grid.children(".stage-0").length == 1)
	{
		numRounds = grid.children("div").length - 1; //<div class="stage-0"> is another thing....
	}
	else
	{
		numRounds = grid.children("div").length
	}
	
	var place = [];
	for (var i = 1; i <= numRounds; i++)
	{
		var placeWinners = [];
		var username;
        
		if (i == numRounds)
		{
			//there are no losers in the last column
            username = grid.children(".stage-" + i).children(".win-los").children(".winner").children(".tplay").children("span").text().trim();
			placeWinners.push(username);
		}
		else
		{
			grid.children(".stage-" + i).children(".win-los").each(function() {
                username = jQuery(this).children(".looser").children(".tplay").children("span").text().trim();
                if (username == "freeslot")
                {
                    return true;
                }
                
				placeWinners.push(username);
			});
		}
		
		place.push(placeWinners);
	}
	
	//create pay-in container
	jQuery("#bracket").after(`<div style='padding-left:25px'>
		<h4>ICCup StarCraft Tournament Command Generator</h4>
		<p id='xboi-cmdgen-payin-container'>Pay-in: <input type='number' min='0' step='1' value='0' id='xboi-cmdgen-payin-input'></p> <br>
		<div id='xboi-cmdgen-prize-container'></div>
		<button type='button' id='xboi-cmdgen-submit'>Generate</button>
		<br><br>
		<textarea rows='25' cols='80' spellcheck=false id='xboi-cmdgen-output'></textarea>
	</div>`);
	
	//create prize container
	for (var v = numRounds; v != 0; v--)
	{
		jQuery("#xboi-cmdgen-prize-container").prepend("<label>" + formatNum(v) + " place prize: </label><input type='number' min='0' step='1' value='0' class='prize " + v + "'><br><br>");
	}
	
	jQuery("#xboi-cmdgen-submit").click(function() {
		//clear previous output and scroll to top every time button is clicked
		jQuery("#xboi-cmdgen-output").val("").scrollTop();
        
		for (var v = 1; v <= numRounds; v++)
		{
			place[numRounds - v].forEach(function(winner) {
				jQuery("#xboi-cmdgen-output").val(jQuery("#xboi-cmdgen-output").val() + "/addloss1 " + winner +" 0 -" + jQuery("#xboi-cmdgen-payin-input").val() + " Pay-in\n");
			});
		}
		
		//repeat loop to separate the two commands
		for (var v = 1; v <= numRounds; v++)
		{
			place[numRounds - v].forEach(function(winner) {
				jQuery("#xboi-cmdgen-output").val(jQuery("#xboi-cmdgen-output").val() + "/addwin1 " + winner +" 0 " + jQuery("#xboi-cmdgen-prize-container").children(".prize." + v).val() + " " + formatNum(v) + " Place\n");
			});
		}

	});
}

addJQuery(main);
