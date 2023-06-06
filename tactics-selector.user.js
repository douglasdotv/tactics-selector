// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
// @version      1.2
// @description  Adds a dropdown menu with overused tactics.
// @author       Douglas Vieira
// @match        https://www.managerzone.com/?p=tactics
// @match        https://www.managerzone.com/?p=national_teams&sub=tactics&type=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=managerzone.com
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Montserrat&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

(function () {
  "use strict";

  let dropdownTactics = [];

  const tacticsDataUrl =
    "https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/tactics.json?callback=?";

  const outfieldPlayersSelector = `.fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper),
  .fieldpos.fieldpos-collision.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper)`;

  window.addEventListener("load", function () {
    const tacSelDiv = createTacSelDiv();

    const dropdown = createDropdownMenu();
    const dropdownDescription = createDropdownDescription();
    const addNewTacticButton = createAddNewTacticButton();
    const hiButton = createHiButton();

    appendChildren(tacSelDiv, [
      dropdownDescription,
      dropdown,
      addNewTacticButton,
      hiButton,
    ]);

    const tacticsBox = document.getElementById("tactics_box");
    insertAfterElement(tacSelDiv, tacticsBox);

    fetchTacticsFromLocalStorage()
      .then((data) => {
        dropdownTactics = data.tactics;
        addTacticsToDropdown(dropdown, dropdownTactics);

        dropdown.addEventListener("change", function () {
          handleTacticSelection(this.value);
        });
      })
      .catch((err) => {
        console.error("Couldn't fetch data from json: ", err);
      });
  });

  logGMStorage();

  function createTacSelDiv() {
    const myDiv = document.createElement("div");
    myDiv.id = "tacSelDiv";
    myDiv.style.width = "100%";
    myDiv.style.display = "flex";
    myDiv.style.alignItems = "center";
    myDiv.style.justifyContent = "flex-start";
    myDiv.style.marginTop = "6px";
    myDiv.style.marginLeft = "6px";
    return myDiv;
  }

  // _____Dropdown Menu_____

  function createDropdownMenu() {
    const dropdown = document.createElement("select");
    setupDropdownMenu(dropdown);

    const placeholderOption = createPlaceholderOption();
    appendChildren(dropdown, [placeholderOption]);

    return dropdown;
  }

  function setupDropdownMenu(dropdown) {
    dropdown.id = "tacticsDropdown";
    dropdown.style.fontSize = "12px";
    dropdown.style.fontFamily = "Montserrat, sans-serif";
    dropdown.style.border = "2px solid #000";
    dropdown.style.borderRadius = "2px";
    dropdown.style.background = "linear-gradient(to right, #add8e6, #e6f7ff)";
    dropdown.style.color = "#000";
    dropdown.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.2)";
    dropdown.style.cursor = "pointer";
    dropdown.style.outline = "none";
    dropdown.style.margin = "6px";
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
    const description = document.createElement("span");
    description.textContent = "Select a custom tactic: ";
    description.style.fontFamily = "Montserrat, sans-serif";
    description.style.fontSize = "12px";
    description.style.color = "#000";
    return description;
  }

  function createHiButton() {
    const button = document.createElement("button");
    button.id = "hiButton";
    button.textContent = "";
    button.style.visibility = "hidden";

    button.addEventListener("click", function () {
      const presetDropdown = document.getElementById("tactics_preset");
      presetDropdown.value = "5-3-2";
      presetDropdown.dispatchEvent(new Event("change"));
    });

    return button;
  }

  function appendChildren(element, children) {
    children.forEach((ch) => {
      element.appendChild(ch);
    });
  }

  function insertAfterElement(toBeInserted, element) {
    element.parentNode.insertBefore(toBeInserted, element.nextSibling);
  }

  async function fetchTacticsFromLocalStorage() {
    const storedTactics = GM_getValue("ls_tactics");
    if (storedTactics) {
      return storedTactics;
    } else {
      const jsonTactics = await fetchTacticsFromJson();
      storeTacticsInLocalStorage(jsonTactics);
      return jsonTactics;
    }
  }

  async function fetchTacticsFromJson() {
    const response = await fetch(tacticsDataUrl);
    return await response.json();
  }

  function storeTacticsInLocalStorage(data) {
    GM_setValue("ls_tactics", data);
  }

  function addTacticsToDropdown(dropdown, tactics) {
    for (const tactic of tactics) {
      const option = document.createElement("option");
      option.value = tactic.name;
      option.text = tactic.name;
      dropdown.appendChild(option);
    }
  }

  function handleTacticSelection(tactic) {
    let outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    const selectedTactic = dropdownTactics.find(
      (tacticData) => tacticData.name === tactic
    );

    if (selectedTactic) {
      if (outfieldPlayers.length < 10) {
        const hiButton = document.getElementById("hiButton");
        hiButton.click();
        setTimeout(() => rearrangePlayers(selectedTactic.coordinates), 1);
      } else {
        rearrangePlayers(selectedTactic.coordinates);
      }
    }
  }

  function rearrangePlayers(coordinates) {
    const outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
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

  // _____Add new tactic_____

  function createAddNewTacticButton() {
    const button = document.createElement("button");
    button.id = "addNewTacticButton";
    button.textContent = "Save Current Tactic";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function () {
      addNewTactic().catch(console.error);
    });

    return button;
  }

  async function addNewTactic() {
    let dropdown = document.getElementById("tacticsDropdown");
  
    let outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );
    if (!validateTacticPlayerCount(outfieldPlayers)) {
      return;
    }
  
    const tacticName = prompt("Please enter a name for your tactic: ");
    const isValidName = await validateTacticName(tacticName);
    if (!isValidName) {
      return;
    }
  
    let coordinates = outfieldPlayers.map((player) => [
      parseInt(player.style.left),
      parseInt(player.style.top),
    ]);
    
    let tactic = {
      name: tacticName,
      coordinates,
      id: generateUniqueId(),
    };
  
    saveTacticToStorage(tactic).catch(console.error);
    addTacticsToDropdown(dropdown, [tactic]);

    dropdownTactics.push(tactic);

    dropdown.value = tactic.name;
    handleTacticSelection(tactic.name);
  }

  function validateTacticPlayerCount(outfieldPlayers) {
    let isGoalkeeper = document.querySelector(
      ".fieldpos.fieldpos-ok.goalkeeper.ui-draggable"
    );

    outfieldPlayers = outfieldPlayers.filter(
      (player) => !player.classList.contains("fieldpos-collision")
    );

    if (outfieldPlayers.length < 10 || !isGoalkeeper) {
      alert("Error: invalid tactic.");
      return false;
    }

    return true;
  }

  async function validateTacticName(name) {
    if (!name) {
      alert("Error: you must provide a name for your tactic.");
      return false;
    }

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };

    if (tacticsData.tactics.some((t) => t.name === name)) {
      alert(
        "Error: a tactic with this name already exists. Please choose a different name."
      );
      return false;
    }

    return true;
  }

  function generateUniqueId() {
    let currentDate = new Date();

    let dateTimeId =
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getDate() +
      "_" +
      currentDate.getHours() +
      "-" +
      currentDate.getMinutes() +
      "-" +
      currentDate.getSeconds();

    let randomShit = Math.random().toString(36).substring(2, 15);
    return dateTimeId + "_" + randomShit;
  }

  async function saveTacticToStorage(tactic) {
    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    tacticsData.tactics.push(tactic);
    await GM_setValue("ls_tactics", tacticsData);
  }

  function logGMStorage() {
    console.log("Tactic Selector GM Storage: ", GM_getValue("ls_tactics"));
  }
})();
