// ==UserScript==
// @name         MZ Tactic Selector
// @namespace    /essenfc
// @version      0.1
// @description  Adds a dropdown menu to automatically set up tactics.
// @author       Douglas Vieira
// @match        https://www.managerzone.com/?p=tactics
// @icon         https://www.google.com/s2/favicons?sz=64&domain=managerzone.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // Wait for the DOM to be fully loaded
  window.addEventListener("load", function () {
    // Get the formation-container div
    let formationContainer = document.getElementById("formation-container");

    // Modify the CSS display property of the formation-container div
    formationContainer.style.display = "flex";
    formationContainer.style.alignItems = "center";
    formationContainer.style.justifyContent = "space-between";

    // Create the description
    let description = document.createElement("span");
    description.textContent = "Select a preset custom tactic: ";
    description.style.marginRight = "10px";

    // Create the dropdown menu
    let dropdown = document.createElement("select");
    dropdown.id = "tacticsDropdown";

    // Style the dropdown
    dropdown.style.padding = "5px";
    dropdown.style.fontSize = "16px";
    dropdown.style.borderRadius = "5px";

    // Add a placeholder option
    let placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.text = "-";
    placeholder.disabled = true;
    placeholder.selected = true;
    dropdown.appendChild(placeholder);

    // Add options for each tactic
    let tactics = ["JPL_test", "Morph"];
    for (let i = 0; i < tactics.length; ++i) {
      let option = document.createElement("option");
      option.value = tactics[i];
      option.text = tactics[i];
      dropdown.appendChild(option);
    }

    // Add the description and the dropdown menu to the formation-container div
    formationContainer.appendChild(description);
    formationContainer.appendChild(dropdown);

    // Define the tactics
    let tacticCoordinates = {
      JPL_test: [
        [97, 194],
        [57, 217],
        [124, 54],
        [191, 60],
        [57, 168],
        [137, 170],
        [97, 241],
        [137, 217],
        [82, 73],
        [97, 145],
      ],
      Morph: [
        [97, 205],
        [144, 205],
        [96, 54],
        [97, 125],
        [50, 205],
        [67, 90],
        [74, 165],
        [121, 165],
        [36, 124],
        [36, 54],
      ],
    };

    // Add an event listener to the dropdown menu
    dropdown.addEventListener("change", function () {
      // Get the selected tactic
      let tactic = this.value;

      // Get the outfield players
      let outfieldPlayers = Array.from(
        document.querySelectorAll(".fieldpos:not(.substitute):not(.goalkeeper)")
      );

      // Move the players based on the selected tactic
      let coordinates = tacticCoordinates[tactic];
      for (let i = 0; i < outfieldPlayers.length; i++) {
        outfieldPlayers[i].style.left = coordinates[i][0] + "px";
        outfieldPlayers[i].style.top = coordinates[i][1] + "px";
      }
    });
  });
})();
