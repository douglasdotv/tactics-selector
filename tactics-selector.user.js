// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
// @version      0.2
// @description  Adds a dropdown menu to automatically set up tactics.
// @author       Douglas Vieira
// @match        https://www.managerzone.com/?p=tactics
// @icon         https://www.google.com/s2/favicons?sz=64&domain=managerzone.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  window.addEventListener("load", function () {
    let formationContainer = document.getElementById("formation-container");
    formationContainer.style.display = "flex";
    formationContainer.style.alignItems = "center";
    formationContainer.style.justifyContent = "space-between";

    let dropdown = document.createElement("select");
    dropdown.id = "tacticsDropdown";
    dropdown.style.padding = "1px";
    dropdown.style.fontSize = "12px";
    dropdown.style.borderRadius = "2px";

    let dropdownDescription = document.createElement("span");
    dropdownDescription.textContent = "Select a custom tactic: ";
    dropdownDescription.style.marginRight = "1px";

    let placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.text = "@";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    dropdown.appendChild(placeholderOption);

    let tacticsDataUrl =
      "https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/data.json?callback=?";
    fetch(tacticsDataUrl)
      .then((response) => response.json())
      .then((data) => {
        for (const tactic of data.tactics) {
          let option = document.createElement("option");
          option.value = tactic.name;
          option.text = tactic.name;
          dropdown.appendChild(option);
        }

        let neededButton = document.createElement("button");
        neededButton.textContent = "";
        neededButton.style.margin = "1px";
        neededButton.style.visibility = "hidden";
        neededButton.addEventListener("click", function () {
          let presetDropdown = document.getElementById("tactics_preset");
          presetDropdown.value = "4-4-2";
          let e = new Event("change");
          presetDropdown.dispatchEvent(e);
        });

        formationContainer.appendChild(dropdownDescription);
        formationContainer.appendChild(dropdown);
        formationContainer.appendChild(neededButton);

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

            let coordinates = {};
            const selectedTactic = data.tactics.find(
              (tacticData) => tacticData.name === tactic
            );

            if (selectedTactic) {
              coordinates = selectedTactic.coordinates;
            }

            for (let i = 0; i < outfieldPlayers.length; ++i) {
              outfieldPlayers[i].style.left = coordinates[i][0] + "px";
              outfieldPlayers[i].style.top = coordinates[i][1] + "px";
            }
          };

          if (outfieldPlayers.length < 10) {
            neededButton.click();
            setTimeout(rearrangePlayers, 1);
          } else {
            rearrangePlayers();
          }
        });
      })
      .catch((error) => {
        console.error('Epic fail: ', error);
      });
  });
})();
