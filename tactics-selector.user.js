// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
// @version      4.0
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

let modal;

(function () {
  "use strict";

  let dropdownTactics = [];

  const defaultTacticsDataUrl =
    "https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/tactics.json?callback=?";

  const outfieldPlayersSelector =
    ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper), .fieldpos.fieldpos-collision.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper)";

  window.addEventListener("load", function () {
    const tacticsSelectorDiv = createTacSelDiv();
    const dropdown = createDropdownMenu();
    const dropdownDescription = createDropdownDescription();
    const addNewTacticBtn = createAddNewTacticButton();
    const deleteTacticBtn = createDeleteTacticButton();
    const renameTacticBtn = createRenameTacticButton();
    const updateTacticBtn = createUpdateTacticButton();
    const clearTacticsBtn = createClearTacticsButton();
    const resetTacticsBtn = createResetTacticsButton();
    const aboutBtn = createAboutButton();
    const hiBtn = createHiButton();

    appendChildren(tacticsSelectorDiv, [
      dropdownDescription,
      dropdown,
      addNewTacticBtn,
      deleteTacticBtn,
      renameTacticBtn,
      updateTacticBtn,
      clearTacticsBtn,
      resetTacticsBtn,
      aboutBtn,
      hiBtn,
    ]);

    if (isSoccerTacticsPage()) {
      insertAfterElement(
        tacticsSelectorDiv,
        document.getElementById("tactics_box")
      );
    }

    modal = createInfoModal();
    document.body.appendChild(modal);
    document.addEventListener("click", function (event) {
      if (modal.style.display === "block" && !modal.contains(event.target)) {
        modal.style.display = "none";
      }
    });

    fetchTacticsFromLocalStorage()
      .then((data) => {
        dropdownTactics = data.tactics;

        dropdownTactics.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        addTacticsToDropdown(dropdown, dropdownTactics);

        dropdown.addEventListener("change", function () {
          handleTacticSelection(this.value);
        });
      })
      .catch((err) => {
        console.error("Couldn't fetch data from json: ", err);
      });
  });

  function createTacSelDiv() {
    const myDiv = document.createElement("div");
    myDiv.id = "tactics_selector_div";
    myDiv.style.width = "100%";
    myDiv.style.display = "flex";
    myDiv.style.flexWrap = "wrap";
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
    description.textContent = "Select a tactic: ";
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
    const response = await fetch(defaultTacticsDataUrl);
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
    button.textContent = "Add current tactic";
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

    const tacticName = prompt("Please enter a name for the tactic: ");
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

    alert("A new tactic has been added.");
  }

  function validateTacticPlayerCount(outfieldPlayers) {
    let isGoalkeeper = document.querySelector(
      ".fieldpos.fieldpos-ok.goalkeeper.ui-draggable"
    );

    outfieldPlayers = outfieldPlayers.filter(
      (player) => !player.classList.contains("fieldpos-collision")
    );

    if (outfieldPlayers.length < 10 || !isGoalkeeper) {
      alert(
        "Error: invalid tactic. You must have 1 goalkeeper and 10 outfield players in valid positions."
      );
      return false;
    }

    return true;
  }

  async function validateTacticName(name) {
    if (!name) {
      alert("Error: you must provide a name for the tactic.");
      return false;
    }

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    if (tacticsData.tactics.some((t) => t.name === name)) {
      alert(
        "Error: a tactic with this name already exists. Please choose a different name."
      );
      return false;
    }

    if (name.length > 50) {
      alert("Error: tactic name must be less than 50 characters.");
      return false;
    }

    return true;
  }

  async function saveTacticToStorage(tactic) {
    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    tacticsData.tactics.push(tactic);
    await GM_setValue("ls_tactics", tacticsData);
  }

  // _____Delete tactic_____

  function createDeleteTacticButton() {
    const button = document.createElement("button");
    button.id = "deleteTacticButton";
    button.textContent = "Delete tactic";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function () {
      deleteTactic().catch(console.error);
    });

    return button;
  }

  async function deleteTactic() {
    let dropdown = document.getElementById("tacticsDropdown");
    let selectedTactic = dropdownTactics.find(
      (tactic) => tactic.name === dropdown.value
    );

    if (!selectedTactic) {
      alert("Error: no tactic selected.");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the tactic "${selectedTactic.name}"?`
    );

    if (!confirmed) {
      return;
    }

    alert(`Tactic "${selectedTactic.name}" was successfully deleted!`);

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    tacticsData.tactics = tacticsData.tactics.filter(
      (tactic) => tactic.id !== selectedTactic.id
    );

    await GM_setValue("ls_tactics", tacticsData);

    dropdownTactics = dropdownTactics.filter(
      (tactic) => tactic.id !== selectedTactic.id
    );

    const selectedOption = Array.from(dropdown.options).find(
      (option) => option.value === selectedTactic.name
    );
    dropdown.remove(selectedOption.index);

    if (dropdown.options[0]?.disabled) {
      dropdown.selectedIndex = 0;
    }
  }

  // _____Rename tactic_____

  function createRenameTacticButton() {
    const button = document.createElement("button");
    button.id = "renameTacticButton";
    button.textContent = "Rename tactic";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function () {
      renameTactic().catch(console.error);
    });

    return button;
  }

  async function renameTactic() {
    let dropdown = document.getElementById("tacticsDropdown");
    let selectedTactic = dropdownTactics.find(
      (tactic) => tactic.name === dropdown.value
    );

    if (!selectedTactic) {
      alert("Error: no tactic selected.");
      return;
    }

    const newName = prompt("Please enter a new name for this tactic: ");
    const isValidName = await validateTacticName(newName);
    if (!isValidName) {
      return;
    }

    const selectedOption = Array.from(dropdown.options).find(
      (option) => option.value === selectedTactic.name
    );

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    tacticsData.tactics = tacticsData.tactics.map((tactic) => {
      if (tactic.id === selectedTactic.id) {
        tactic.name = newName;
      }
      return tactic;
    });

    await GM_setValue("ls_tactics", tacticsData);

    dropdownTactics = dropdownTactics.map((tactic) => {
      if (tactic.id === selectedTactic.id) {
        tactic.name = newName;
      }
      return tactic;
    });

    selectedOption.value = newName;
    selectedOption.textContent = newName;

    alert("Tactic was successfully renamed!");
  }

  // _____Update tactic_____

  function createUpdateTacticButton() {
    const button = document.createElement("button");
    button.id = "updateTacticButton";
    button.textContent = "Update tactic";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function () {
      updateTactic().catch(console.error);
    });

    return button;
  }

  async function updateTactic() {
    let dropdown = document.getElementById("tacticsDropdown");
    let outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    let selectedTactic = dropdownTactics.find(
      (tactic) => tactic.name === dropdown.value
    );

    if (!selectedTactic) {
      alert("Error: no tactic selected.");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to update "${selectedTactic.name}" coordinates?`
    );

    if (!confirmed) {
      return;
    }

    alert(
      `Tactic "${selectedTactic.name}" coordinates were successfully updated!`
    );

    let updatedCoordinates = outfieldPlayers.map((player) => [
      parseInt(player.style.left),
      parseInt(player.style.top),
    ]);

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };

    for (let tactic of tacticsData.tactics) {
      if (tactic.id === selectedTactic.id) {
        tactic.coordinates = updatedCoordinates;
      }
    }

    for (let tactic of dropdownTactics) {
      if (tactic.id === selectedTactic.id) {
        tactic.coordinates = updatedCoordinates;
      }
    }

    await GM_setValue("ls_tactics", tacticsData);
  }

  // _____Clear tactics_____

  function createClearTacticsButton() {
    const button = document.createElement("button");
    button.id = "clearButton";
    button.textContent = "Clear tactics";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function () {
      clearTactics().catch(console.error);
    });

    return button;
  }

  async function clearTactics() {
    const confirmed = confirm(
      "Are you sure you want to clear all tactics? This action will delete all saved tactics and cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    await GM_setValue("ls_tactics", { tactics: [] });
    dropdownTactics = [];

    const dropdown = document.getElementById("tacticsDropdown");
    dropdown.innerHTML = "";
    dropdown.disabled = true;

    alert("Tactics successfully cleared!");
  }

  // _____Reset default settings_____

  function createResetTacticsButton() {
    const button = document.createElement("button");
    button.id = "resetButton";
    button.textContent = "Reset tactics";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function () {
      resetTactics().catch(console.error);
    });

    return button;
  }

  async function resetTactics() {
    const confirmed = confirm(
      "Are you sure you want to reset? This action will overwrite all saved tactics and cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(defaultTacticsDataUrl);
    const data = await response.json();
    const defaultTactics = data.tactics;

    await GM_setValue("ls_tactics", { tactics: defaultTactics });
    dropdownTactics = defaultTactics;

    const dropdown = document.getElementById("tacticsDropdown");
    dropdown.innerHTML = "";
    dropdown.appendChild(createPlaceholderOption());
    addTacticsToDropdown(dropdown, dropdownTactics);
    dropdown.disabled = false;

    alert("Reset done!");
  }

  // _____About button_____

  function createAboutButton() {
    const button = document.createElement("button");
    button.id = "aboutButton";
    button.textContent = "About";
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (modal.style.display === "none" || modal.style.opacity === "0") {
        showInfo();
      }
    });

    return button;
  }

  function showInfo() {
    modal.style.display = "block";
    setTimeout(function () {
      modal.style.opacity = "1";
    }, 0);
  }

  function hideInfo() {
    modal.style.opacity = "0";
    setTimeout(function () {
      modal.style.display = "none";
    }, 500);
  }

  function createInfoModal() {
    const modal = document.createElement("div");
    setupInfoModal(modal);

    const modalContent = createModalContent();
    modal.appendChild(modalContent);

    window.onclick = function (event) {
      if (event.target == modal) {
        hideInfo();
      }
    };

    return modal;
  }

  function setupInfoModal(modal) {
    modal.id = "infoModal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.zIndex = "1";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.opacity = "0";
    modal.style.transition = "opacity 0.5s ease-in-out";
  }

  function createModalContent() {
    const modalContent = document.createElement("div");
    styleModalContent(modalContent);

    const title = createTitle();
    const infoText = createInfoText();
    const feedbackText = createFeedbackText();

    modalContent.appendChild(title);
    modalContent.appendChild(infoText);
    modalContent.appendChild(feedbackText);

    return modalContent;
  }

  function styleModalContent(content) {
    content.style.backgroundColor = "#fefefe";
    content.style.margin = "auto";
    content.style.padding = "20px";
    content.style.border = "1px solid #888";
    content.style.width = "80%";
    content.style.maxWidth = "500px";
    content.style.borderRadius = "10px";
    content.style.fontFamily = "Montserrat, sans-serif";
    content.style.textAlign = "center";
    content.style.color = "#000";
    content.style.fontSize = "16px";
    content.style.lineHeight = "1.5";
  }

  function createTitle() {
    const title = document.createElement("h2");
    title.textContent = "MZ Tactics Selector";
    title.style.fontSize = "24px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "20px";
    return title;
  }

  function createInfoText() {
    const infoText = document.createElement("p");
    infoText.innerHTML =
      'For instructions, click <a href="https://greasyfork.org/pt-BR/scripts/467712-mz-tactics-selector" style="color: #007BFF;">here</a>.';
    return infoText;
  }

  function createFeedbackText() {
    const feedbackText = document.createElement("p");
    feedbackText.innerHTML =
      'If you run into any issues or have any suggestions, contact me here: <a href="https://www.managerzone.com/?p=guestbook&uid=8577497"><img src="https://www.managerzone.com/img/soccer/reply_guestbook.gif"></a>';
    return feedbackText;
  }

  // _____Other_____

  function appendChildren(element, children) {
    children.forEach((ch) => {
      element.appendChild(ch);
    });
  }

  function insertAfterElement(toBeInserted, element) {
    element.parentNode.insertBefore(toBeInserted, element.nextSibling);
  }

  function generateUniqueId() {
    let currentDate = new Date();
    return (
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
      currentDate.getSeconds() +
      "_" +
      Math.random().toString(36).substring(2, 15)
    );
  }

  function isSoccerTacticsPage() {
    return document.getElementById("tactics_box").classList.contains("soccer");
  }
})();
