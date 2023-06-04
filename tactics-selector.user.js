// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
// @version      0.5
// @description  Adds a dropdown menu to choose from a list of overused tactics.
// @author       Douglas Vieira
// @match        https://www.managerzone.com/?p=tactics
// @icon         https://www.google.com/s2/favicons?sz=64&domain=managerzone.com
// @grant        none
// @license      MIT
// ==/UserScript==

const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Montserrat&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

(function () {
  "use strict";

  let tactics = [];
  const tacticsDataUrl =
    "https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/tactics.json?callback=?";

  window.addEventListener("load", function () {
    const formationContainer = document.getElementById("formation-container");
    formationContainer.style.display = "flex";
    formationContainer.style.alignItems = "center";
    formationContainer.style.justifyContent = "space-between";

    const dropdown = createDropdown();
    const dropdownDescription = createDropdownDescription();
    const hButton = createHiButton();

    formationContainer.appendChild(dropdownDescription);
    formationContainer.appendChild(dropdown);
    formationContainer.appendChild(hButton);

    fetchTacticsData()
      .then((data) => {
        tactics = data.tactics;
        addTacticsToDropdown(dropdown, tactics);

        dropdown.addEventListener("change", function () {
          const tactic = this.value;

          let outfieldPlayers = Array.from(
            document.querySelectorAll(
              ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.substitute.goalkeeper):not(.goalkeeper), .fieldpos.fieldpos-collision.ui-draggable:not(.substitute):not(.substitute.goalkeeper):not(.goalkeeper)"
            )
          );

          const selectedTactic = data.tactics.find(
            (tacticData) => tacticData.name === tactic
          );

          if (selectedTactic) {
            if (outfieldPlayers.length < 10) {
              hButton.click();
              setTimeout(() => rearrangePlayers(selectedTactic.coordinates), 1);
            } else {
              rearrangePlayers(selectedTactic.coordinates);
            }
          }
        });
      })
      .catch((err) => {
        console.error("Couldn't fetch data: ", err);
      });
  });

  function createDropdown() {
    const dropdown = document.createElement("select");
    setupDropdown(dropdown);

    const placeholderOption = createPlaceholderOption();
    dropdown.appendChild(placeholderOption);

    return dropdown;
  }

  function setupDropdown(dd) {
    dd.id = "tacticsDropdown";
    dd.style.padding = "2px 5px";
    dd.style.fontSize = "12px";
    dd.style.fontFamily = "Montserrat, sans-serif";
    dd.style.border = "2px solid #000";
    dd.style.borderRadius = "5px";
    dd.style.background = "linear-gradient(to right, #add8e6, #e6f7ff)";
    dd.style.color = "#000";
    dd.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.2)";
    dd.style.cursor = "pointer";
    dd.style.outline = "none";
  }

  function createPlaceholderOption() {
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.text = "";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    return placeholderOption;
  }

  function createDropdownDescription() {
    const dropdownDescription = document.createElement("span");
    dropdownDescription.textContent = "Select a custom tactic: ";
    dropdownDescription.style.marginRight = "1px";
    dropdownDescription.style.fontFamily = "Montserrat, sans-serif";
    dropdownDescription.style.fontSize = "12px";
    dropdownDescription.style.color = "#000";
    return dropdownDescription;
  }

  function createHiButton() {
    const button = document.createElement("button");
    button.textContent = "";
    button.style.visibility = "hidden";

    button.addEventListener("click", function () {
      const presetDropdown = document.getElementById("tactics_preset");
      presetDropdown.value = "5-3-2";
      presetDropdown.dispatchEvent(new Event("change"));
    });

    return button;
  }

  async function fetchTacticsData() {
    const response = await fetch(tacticsDataUrl);
    return await response.json();
  }

  function addTacticsToDropdown(dropdown, tactics) {
    for (const tactic of tactics) {
      const option = document.createElement("option");
      option.value = tactic.name;
      option.text = tactic.name;
      dropdown.appendChild(option);
    }
  }

  function rearrangePlayers(coordinates) {
    const outfieldPlayers = Array.from(
      document.querySelectorAll(
        ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper), .fieldpos.fieldpos-collision.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper)"
      )
    );

    for (let i = 0; i < outfieldPlayers.length; ++i) {
      outfieldPlayers[i].style.left = coordinates[i][0] + "px";
      outfieldPlayers[i].style.top = coordinates[i][1] + "px";

      if (outfieldPlayers[i].classList.contains("fieldpos-collision")) {
        outfieldPlayers[i].classList.remove("fieldpos-collision");
        outfieldPlayers[i].classList.add("fieldpos-ok");
      }
    }
  }
})();
