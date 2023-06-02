// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
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

    // Create and style the dropdown menu
    let dropdown = document.createElement("select");
    dropdown.id = "tacticsDropdown";
    dropdown.style.padding = "2px";
    dropdown.style.fontSize = "12px";
    dropdown.style.borderRadius = "2px";

    // Create description for dropdown menu
    let description = document.createElement("span");
    description.textContent = "Select a preset custom tactic: ";
    description.style.marginRight = "5px";

    // Add placeholder option
    let placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.text = "@";
    placeholder.disabled = true;
    placeholder.selected = true;
    dropdown.appendChild(placeholder);

    // Add tactic options to dropdown menu
    let tactics = ["JPL_test", "Morph"];
    for (const element of tactics) {
      let option = document.createElement("option");
      option.value = element;
      option.text = element;
      dropdown.appendChild(option);
    }

    // Create needed button for < 10 players case
    let button = document.createElement("button");
    button.textContent = "";
    button.style.margin = "2px";
    button.style.visibility = "hidden";
    button.addEventListener("click", function () {
      let presetDropdown = document.getElementById("tactics_preset");
      presetDropdown.value = "4-4-2";
      let e = new Event("change");
      presetDropdown.dispatchEvent(e);
    });

    // Add the description/dropdown menu, and the button to the formation-container div
    formationContainer.appendChild(description);
    formationContainer.appendChild(dropdown);
    formationContainer.appendChild(button);

    // Tactics that will be displayed on the dropdown menu
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

    // Handle dropdown menu options
    dropdown.addEventListener("change", function () {
      let tactic = this.value;

      let outfieldPlayers = Array.from(
        document.querySelectorAll(
          ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.substitute.goalkeeper):not(.goalkeeper)"
        )
      );

      let rearrangePlayers = function () {
        outfieldPlayers = Array.from(
          document.querySelectorAll(
            ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.substitute.goalkeeper):not(.goalkeeper)"
          )
        );

        // Move the players based on the selected tactic
        let coordinates = tacticCoordinates[tactic];
        for (let i = 0; i < outfieldPlayers.length; ++i) {
          outfieldPlayers[i].style.left = coordinates[i][0] + "px";
          outfieldPlayers[i].style.top = coordinates[i][1] + "px";
        }
      };

      if (outfieldPlayers.length < 10) {
        button.click();
        setTimeout(rearrangePlayers, 1);
      } else {
        rearrangePlayers();
      }
    });
  });
})();
