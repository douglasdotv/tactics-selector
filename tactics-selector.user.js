// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
// @version      4.6
// @description  Adds a dropdown menu with overused tactics.
// @author       Douglas Vieira
// @match        https://www.managerzone.com/?p=tactics
// @match        https://www.managerzone.com/?p=national_teams&sub=tactics&type=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=managerzone.com
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  document.head.appendChild(getFontLink());

  let dropdownTactics = [];

  const defaultTacticsDataUrl =
    "https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/json/tactics.json?callback=?";

  const tacticsBox = document.getElementById("tactics_box");

  const tacticsPreset = document.getElementById("tactics_preset");

  const outfieldPlayersSelector =
    ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper), .fieldpos.fieldpos-collision.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper)";

  const goalkeeperSelector = ".fieldpos.fieldpos-ok.goalkeeper.ui-draggable";

  const minOutfieldPlayers = 10;

  const maxTacticNameLength = 50;

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
    const importTacticsBtn = createImportTacticsButton();
    const exportTacticsBtn = createExportTacticsButton();
    const aboutBtn = createAboutButton();
    const hiddenTriggerBtn = createHiddenTriggerButton();

    appendChildren(tacticsSelectorDiv, [
      dropdownDescription,
      dropdown,
      addNewTacticBtn,
      deleteTacticBtn,
      renameTacticBtn,
      updateTacticBtn,
      clearTacticsBtn,
      resetTacticsBtn,
      importTacticsBtn,
      exportTacticsBtn,
      aboutBtn,
      hiddenTriggerBtn,
    ]);

    if (isSoccerTacticsPage()) {
      insertAfterElement(tacticsSelectorDiv, tacticsBox);
    }

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

  const infoModal = createInfoModal();
  document.body.appendChild(infoModal);
  document.addEventListener("click", function (event) {
    if (
      infoModal.style.display === "block" &&
      !infoModal.contains(event.target)
    ) {
      infoModal.style.display = "none";
    }
  });

  // _____Dropdown Menu_____

  function createTacSelDiv() {
    const div = document.createElement("div");
    setupMainDiv(div);
    return div;
  }

  function createDropdownMenu() {
    const dropdown = document.createElement("select");
    setupDropdownMenu(dropdown, "tactics_dropdown_menu");

    const placeholderOption = createPlaceholderOption();
    appendChildren(dropdown, [placeholderOption]);

    return dropdown;
  }

  function createDropdownDescription() {
    const description = document.createElement("span");
    setupDropdownMenuLabel(description, "dropdown_description", "Select a tactic: ");
    return description;
  }

  function createHiddenTriggerButton() {
    const button = document.createElement("button");
    button.id = "hidden_trigger_button";
    button.textContent = "";
    button.style.visibility = "hidden";

    button.addEventListener("click", function () {
      tacticsPreset.value = "5-3-2";
      tacticsPreset.dispatchEvent(new Event("change"));
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
    const outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    const selectedTactic = dropdownTactics.find(
      (tacticData) => tacticData.name === tactic
    );

    if (selectedTactic) {
      if (outfieldPlayers.length < minOutfieldPlayers) {
        const hiddenTriggerButton = document.getElementById(
          "hidden_trigger_button"
        );
        hiddenTriggerButton.click();
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

    findBestPositions(outfieldPlayers, coordinates);

    for (let i = 0; i < outfieldPlayers.length; ++i) {
      outfieldPlayers[i].style.left = coordinates[i][0] + "px";
      outfieldPlayers[i].style.top = coordinates[i][1] + "px";
      checkForCollision(outfieldPlayers[i]);
    }

    updateFormationText(getFormation(coordinates));
  }

  function findBestPositions(players, coordinates) {
    players.sort((a, b) => parseInt(a.style.top) - parseInt(b.style.top));
    coordinates.sort((a, b) => a[1] - b[1]);
  }

  function checkForCollision(player) {
    if (player.classList.contains("fieldpos-collision")) {
      player.classList.remove("fieldpos-collision");
      player.classList.add("fieldpos-ok");
    }
  }

  function getFormation(coordinates) {
    let strikers = 0;
    let midfielders = 0;
    let defenders = 0;

    for (const coo of coordinates) {
      const y = coo[1];
      if (y < 103) {
        strikers++;
      } else if (y <= 204) {
        midfielders++;
      } else {
        defenders++;
      }
    }

    return { strikers, midfielders, defenders };
  }

  function updateFormationText(formation) {
    const formationTextElement = document.querySelector("#formation_text");
    formationTextElement.querySelector(".defs").textContent =
      formation.defenders;
    formationTextElement.querySelector(".mids").textContent =
      formation.midfielders;
    formationTextElement.querySelector(".atts").textContent =
      formation.strikers;
  }

  // _____Add new tactic_____

  function createAddNewTacticButton() {
    const button = document.createElement("button");
    setupButton(button, "add_button", "Add current tactic");

    button.addEventListener("click", function () {
      addNewTactic().catch(console.error);
    });

    return button;
  }

  async function addNewTactic() {
    const tacticsDropdown = document.getElementById("tactics_dropdown_menu");

    const outfieldPlayers = Array.from(
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

    const coordinates = outfieldPlayers.map((player) => [
      parseInt(player.style.left),
      parseInt(player.style.top),
    ]);

    const tactic = {
      name: tacticName,
      coordinates,
      id: generateUniqueId(),
    };

    saveTacticToStorage(tactic).catch(console.error);
    addTacticsToDropdown(tacticsDropdown, [tactic]);
    dropdownTactics.push(tactic);

    tacticsDropdown.value = tactic.name;
    handleTacticSelection(tactic.name);

    alert(`Tactic "${tactic.name}" has been added.`);
  }

  function validateTacticPlayerCount(outfieldPlayers) {
    const isGoalkeeper = document.querySelector(goalkeeperSelector);

    outfieldPlayers = outfieldPlayers.filter(
      (player) => !player.classList.contains("fieldpos-collision")
    );

    if (outfieldPlayers.length < minOutfieldPlayers || !isGoalkeeper) {
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

    if (name.length > maxTacticNameLength) {
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
    setupButton(button, "delete_button", "Delete tactic");

    button.addEventListener("click", function () {
      deleteTactic().catch(console.error);
    });

    return button;
  }

  async function deleteTactic() {
    const tacticsDropdown = document.getElementById("tactics_dropdown_menu");
    const selectedTactic = dropdownTactics.find(
      (tactic) => tactic.name === tacticsDropdown.value
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

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    tacticsData.tactics = tacticsData.tactics.filter(
      (tactic) => tactic.id !== selectedTactic.id
    );

    await GM_setValue("ls_tactics", tacticsData);

    dropdownTactics = dropdownTactics.filter(
      (tactic) => tactic.id !== selectedTactic.id
    );

    const selectedOption = Array.from(tacticsDropdown.options).find(
      (option) => option.value === selectedTactic.name
    );
    tacticsDropdown.remove(selectedOption.index);

    if (tacticsDropdown.options[0]?.disabled) {
      tacticsDropdown.selectedIndex = 0;
    }

    alert(`Tactic "${selectedTactic.name}" was successfully deleted!`);
  }

  // _____Rename tactic_____

  function createRenameTacticButton() {
    const button = document.createElement("button");
    setupButton(button, "rename_button", "Rename tactic");

    button.addEventListener("click", function () {
      renameTactic().catch(console.error);
    });

    return button;
  }

  async function renameTactic() {
    const tacticsDropdown = document.getElementById("tactics_dropdown_menu");
    const selectedTactic = dropdownTactics.find(
      (tactic) => tactic.name === tacticsDropdown.value
    );

    if (!selectedTactic) {
      alert("Error: no tactic selected.");
      return;
    }

    const oldName = selectedTactic.name;

    const newName = prompt("Please enter a new name for this tactic: ");
    const isValidName = await validateTacticName(newName);
    if (!isValidName) {
      return;
    }

    const selectedOption = Array.from(tacticsDropdown.options).find(
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

    alert(`Tactic "${oldName}" has been renamed to "${newName}".`);
  }

  // _____Update tactic_____

  function createUpdateTacticButton() {
    const button = document.createElement("button");
    setupButton(button, "update_button", "Update tactic");

    button.addEventListener("click", function () {
      updateTactic().catch(console.error);
    });

    return button;
  }

  async function updateTactic() {
    const tacticsDropdown = document.getElementById("tactics_dropdown");
    const outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    const tacticsDropdown = document.getElementById("tactics_dropdown_menu");

    const selectedTactic = dropdownTactics.find(
      (tactic) => tactic.name === tacticsDropdown.value
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

    const updatedCoordinates = outfieldPlayers.map((player) => [
      parseInt(player.style.left),
      parseInt(player.style.top),
    ]);

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };

    for (const tactic of tacticsData.tactics) {
      if (tactic.id === selectedTactic.id) {
        tactic.coordinates = updatedCoordinates;
      }
    }

    for (const tactic of dropdownTactics) {
      if (tactic.id === selectedTactic.id) {
        tactic.coordinates = updatedCoordinates;
      }
    }

    await GM_setValue("ls_tactics", tacticsData);

    alert(
      `Tactic "${selectedTactic.name}" coordinates were successfully updated!`
    );
  }

  // _____Clear tactics_____

  function createClearTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "clear_button", "Clear tactics");

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

    const tacticsDropdown = document.getElementById("tactics_dropdown_menu");
    tacticsDropdown.innerHTML = "";
    tacticsDropdown.disabled = true;

    alert("Tactics successfully cleared!");
  }

  // _____Reset default settings_____

  function createResetTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "reset_button", "Reset tactics");

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

    const tacticsDropdown = document.getElementById("tactics_dropdown_menu");
    tacticsDropdown.innerHTML = "";
    tacticsDropdown.appendChild(createPlaceholderOption());
    addTacticsToDropdown(tacticsDropdown, dropdownTactics);
    tacticsDropdown.disabled = false;

    alert("Reset done!");
  }

  // _____Import/Export_____

  function createImportTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "import_button", "Import tactics");

    button.addEventListener("click", function () {
      importTactics().catch(console.error);
    });

    return button;
  }

  function createExportTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "export_button", "Export tactics");
    button.addEventListener("click", exportTactics);
    return button;
  }

  async function importTactics() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async function (event) {
        const importedTactics = JSON.parse(event.target.result).tactics;

        let existingTactics = await GM_getValue("ls_tactics", { tactics: [] });
        existingTactics = existingTactics.tactics;

        const mergedTactics = [...existingTactics];
        for (const importedTactic of importedTactics) {
          if (
            !existingTactics.some((tactic) => tactic.id === importedTactic.id)
          ) {
            mergedTactics.push(importedTactic);
          }
        }

        await GM_setValue("ls_tactics", { tactics: mergedTactics });
        mergedTactics.sort((a, b) => a.name.localeCompare(b.name));

        dropdownTactics = mergedTactics;

        const tacticsDropdown = document.getElementById("tactics_dropdown_menu");
        tacticsDropdown.innerHTML = "";
        tacticsDropdown.append(createPlaceholderOption());
        addTacticsToDropdown(tacticsDropdown, dropdownTactics);
        tacticsDropdown.disabled = false;
      };

      reader.readAsText(file);
    };

    input.click();
  }

  function exportTactics() {
    const tactics = GM_getValue("ls_tactics", { tactics: [] });
    const tacticsJson = JSON.stringify(tactics);
    const blob = new Blob([tacticsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "tactics.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  // _____About button_____

  function createAboutButton() {
    const button = document.createElement("button");
    setupButton(button, "about_button", "About");

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (
        infoModal.style.display === "none" ||
        infoModal.style.opacity === "0"
      ) {
        showInfo();
      }
    });

    return button;
  }

  function showInfo() {
    infoModal.style.display = "block";
    setTimeout(function () {
      infoModal.style.opacity = "1";
    }, 0);
  }

  function hideInfo() {
    infoModal.style.opacity = "0";
    setTimeout(function () {
      infoModal.style.display = "none";
    }, 500);
  }

  function createInfoModal() {
    const modal = document.createElement("div");
    setupModal(modal, "info_modal");

    const modalContent = createModalContent();
    modal.appendChild(modalContent);

    window.onclick = function (event) {
      if (event.target == modal) {
        hideInfo();
      }
    };

    return modal;
  }

  function setupModal(modal, id) {
    modal.id = id;
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

  function getFontLink() {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Montserrat&display=swap";
    fontLink.rel = "stylesheet";
    return fontLink;
  }

  function isSoccerTacticsPage() {
    return document.getElementById("tactics_box").classList.contains("soccer");
  }

  function appendChildren(parent, children) {
    children.forEach((ch) => {
      parent.appendChild(ch);
    });
  }

  function insertAfterElement(something, element) {
    element.parentNode.insertBefore(something, element.nextSibling);
  }

  function setupMainDiv(div) {
    div.id = "tactics_selector_div";
    div.style.width = "100%";
    div.style.display = "flex";
    div.style.flexWrap = "wrap";
    div.style.alignItems = "center";
    div.style.justifyContent = "flex-start";
    div.style.marginTop = "6px";
    div.style.marginLeft = "6px";
  }

  function setupDropdownMenu(dropdown, id) {
    dropdown.id = id;
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

  function setupDropdownMenuLabel(description, id, textContent) {
    description.id = id;
    description.textContent = textContent;
    description.style.fontFamily = "Montserrat, sans-serif";
    description.style.fontSize = "12px";
    description.style.color = "#000";
  }

  function setupButton(button, id, textContent) {
    button.id = id;
    button.textContent = textContent;
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#000";
    button.style.marginLeft = "6px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.2)";
  }

  function generateUniqueId() {
    const currentDate = new Date();
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
})();
