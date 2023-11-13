// ==UserScript==
// @name         MZ Tactics Selector
// @namespace    douglaskampl
// @version      7.2
// @description  Adds a dropdown menu with overused tactics and lets you save your own tactics for quick access later on.
// @author       Douglas Vieira
// @match        https://www.managerzone.com/?p=tactics
// @match        https://www.managerzone.com/?p=national_teams&sub=tactics&type=*
// @match        https://www.managerzone.com/?p=players
// @icon         https://www.google.com/s2/favicons?sz=64&domain=managerzone.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      https://unpkg.com/jssha@3.3.0/dist/sha256.js
// @require      https://unpkg.com/i18next@21.6.3/i18next.min.js
// @license      MIT
// ==/UserScript==

GM_addStyle(
  "@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');"
);

(function () {
  "use strict";

  let dropdownMenuTactics = [];

  const defaultTacticsDataUrl =
    "https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/json/tactics.json?callback=?";

  let activeLanguage;

  const flagsDataUrl = {
    gb: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/gb.svg",
    br: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/br.svg",
    cn: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/cn.svg",
    se: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/se.svg",
    no: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/no.svg",
    dk: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/dk.svg",
    ar: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/ar.svg",
    pl: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/pl.svg",
    nl: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/nl.svg",
    id: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/id.svg",
    de: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/de.svg",
    it: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/it.svg",
    fr: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/fr.svg",
    ro: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/ro.svg",
    tr: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/tr.svg",
    kr: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/kr.svg",
    ru: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/ru.svg",
    sa: "https://raw.githubusercontent.com/lipis/flag-icons/d6785f2434e54e775d55a304733d17b048eddfb5/flags/4x3/sa.svg",
  };

  const languages = [
    { code: "en", name: "English", flag: flagsDataUrl.gb },
    { code: "pt", name: "Português", flag: flagsDataUrl.br },
    { code: "zh", name: "中文", flag: flagsDataUrl.cn },
    { code: "sv", name: "Svenska", flag: flagsDataUrl.se },
    { code: "no", name: "Norsk", flag: flagsDataUrl.no },
    { code: "da", name: "Dansk", flag: flagsDataUrl.dk },
    { code: "es", name: "Español", flag: flagsDataUrl.ar },
    { code: "pl", name: "Polski", flag: flagsDataUrl.pl },
    { code: "nl", name: "Nederlands", flag: flagsDataUrl.nl },
    { code: "id", name: "Bahasa Indonesia", flag: flagsDataUrl.id },
    { code: "de", name: "Deutsch", flag: flagsDataUrl.de },
    { code: "it", name: "Italiano", flag: flagsDataUrl.it },
    { code: "fr", name: "Français", flag: flagsDataUrl.fr },
    { code: "ro", name: "Română", flag: flagsDataUrl.ro },
    { code: "tr", name: "Türkçe", flag: flagsDataUrl.tr },
    { code: "ko", name: "한국어", flag: flagsDataUrl.kr },
    { code: "ru", name: "Русский", flag: flagsDataUrl.ru },
    { code: "ar", name: "العربية", flag: flagsDataUrl.sa },
  ];

  const strings = {
    addButton: "",
    deleteButton: "",
    renameButton: "",
    updateButton: "",
    clearButton: "",
    resetButton: "",
    importButton: "",
    exportButton: "",
    aboutButton: "",
    tacticNamePrompt: "",
    addAlert: "",
    deleteAlert: "",
    renameAlert: "",
    updateAlert: "",
    clearAlert: "",
    resetAlert: "",
    deleteConfirmation: "",
    updateConfirmation: "",
    clearConfirmation: "",
    resetConfirmation: "",
    invalidTacticError: "",
    noTacticNameProvidedError: "",
    alreadyExistingTacticNameError: "",
    tacticNameLengthError: "",
    noTacticSelectedError: "",
    duplicateTacticError: "",
    modalContentInfoText: "",
    modalContentFeedbackText: "",
    tacticsDropdownMenuLabel: "",
    languageDropdownMenuLabel: "",
  };

  const elementStringKeys = {
    add_tactic_button: "addButton",
    delete_tactic_button: "deleteButton",
    rename_tactic_button: "renameButton",
    update_tactic_button: "updateButton",
    clear_tactics_button: "clearButton",
    reset_tactics_button: "resetButton",
    import_tactics_button: "importButton",
    export_tactics_button: "exportButton",
    about_button: "aboutButton",
    tactics_dropdown_menu_label: "tacticsDropdownMenuLabel",
    language_dropdown_menu_label: "languageDropdownMenuLabel",
    info_modal_info_text: "modalContentInfoText",
    info_modal_feedback_text: "modalContentFeedbackText",
  };

  let infoModal;

  const tacticsBox = document.getElementById("tactics_box");

  const tacticsPreset = document.getElementById("tactics_preset");

  const outfieldPlayersSelector =
    ".fieldpos.fieldpos-ok.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper), .fieldpos.fieldpos-collision.ui-draggable:not(.substitute):not(.goalkeeper):not(.substitute.goalkeeper)";

  const goalkeeperSelector = ".fieldpos.fieldpos-ok.goalkeeper.ui-draggable";

  const formationTextSelector = "#formation_text";

  const tacticSlotSelector =
    ".ui-state-default.ui-corner-top.ui-tabs-selected.ui-state-active.invalid";

  const minOutfieldPlayers = 10;

  const maxTacticNameLength = 50;

  async function initialize() {
    if (tacticsBox) {
      activeLanguage = getActiveLanguage();
      i18next
        .init({
          lng: activeLanguage,
          resources: {
            [activeLanguage]: {
              translation: await (
                await fetch(
                  `https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/json/lang/${activeLanguage}.json?callback=?`
                )
              ).json(),
            },
          },
        })
        .then(() => {
          const tacticsSelectorDiv = createTacticsSelectorDiv();

          if (isFootball()) {
            insertAfterElement(tacticsSelectorDiv, tacticsBox);
          }

          const firstRow = createRow("tactics_selector_div_first_row");
          const secondRow = createRow("tactics_selector_div_second_row");

          appendChildren(tacticsSelectorDiv, [
            firstRow,
            secondRow,
            createHiddenTriggerButton(),
          ]);

          setupFirstRow();
          setupSecondRow();

          fetchTacticsFromGMStorage()
            .then((data) => {
              const tacticsDropdownMenu = document.getElementById(
                "tactics_dropdown_menu"
              );

              dropdownMenuTactics = data.tactics;
              dropdownMenuTactics.sort((a, b) => {
                return a.name.localeCompare(b.name);
              });

              addTacticsToDropdownMenu(
                tacticsDropdownMenu,
                dropdownMenuTactics
              );

              tacticsDropdownMenu.addEventListener("change", function () {
                handleTacticsSelection(this.value);
              });
            })
            .catch((err) => {
              console.error("Couldn't fetch data from json: ", err);
            });
          setInfoModal();
          updateTranslation();
        });
    }
    applyUxxFilter();
  }

  window.addEventListener("load", function () {
    initialize().catch((err) => {
      console.error("Init error: ", err);
    });
  });

  // _____Tactics Dropdown Menu_____

  function createTacticsDropdownMenu() {
    const dropdown = document.createElement("select");
    setupDropdownMenu(dropdown, "tactics_dropdown_menu");
    appendChildren(dropdown, [createPlaceholderOption()]);
    return dropdown;
  }

  function createHiddenTriggerButton() {
    /*
     * The purpose of this button is to trigger the tactics preset change event: it changes the tactic to the default 5-3-2.
     * It's a workaround to put 10 players on the field when the user has less than 10 players on the field and selects a tactic.
     * If that happens, the pitch will be filled with 10 players in a 5-3-2 formation, then they will be rearranged to the selected tactic.
     */
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

  async function fetchTacticsFromGMStorage() {
    const storedTactics = GM_getValue("ls_tactics");
    if (storedTactics) {
      return storedTactics;
    } else {
      const jsonTactics = await fetchTacticsFromJson();
      storeTacticsInGMStorage(jsonTactics);
      return jsonTactics;
    }
  }

  async function fetchTacticsFromJson() {
    const response = await fetch(defaultTacticsDataUrl);
    return await response.json();
  }

  function storeTacticsInGMStorage(data) {
    GM_setValue("ls_tactics", data);
  }

  function addTacticsToDropdownMenu(dropdown, tactics) {
    for (const tactic of tactics) {
      const option = document.createElement("option");
      option.value = tactic.name;
      option.text = tactic.name;
      dropdown.appendChild(option);
    }
  }

  function handleTacticsSelection(tactic) {
    const outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    const selectedTactic = dropdownMenuTactics.find(
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
      removeCollision(outfieldPlayers[i]);
    }

    removeTacticSlotInvalidStatus();
    updateFormationText(getFormation(coordinates));
  }

  function findBestPositions(players, coordinates) {
    players.sort((a, b) => parseInt(a.style.top) - parseInt(b.style.top));
    coordinates.sort((a, b) => a[1] - b[1]);
  }

  function removeCollision(player) {
    if (player.classList.contains("fieldpos-collision")) {
      player.classList.remove("fieldpos-collision");
      player.classList.add("fieldpos-ok");
    }
  }

  function removeTacticSlotInvalidStatus() {
    const slot = document.querySelector(tacticSlotSelector);
    if (slot) {
      slot.classList.remove("invalid");
    }
  }

  function updateFormationText(formation) {
    const formationTextElement = document.querySelector(formationTextSelector);
    formationTextElement.querySelector(".defs").textContent =
      formation.defenders;
    formationTextElement.querySelector(".mids").textContent =
      formation.midfielders;
    formationTextElement.querySelector(".atts").textContent =
      formation.strikers;
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

  // _____Add new tactic_____

  function createAddNewTacticButton() {
    const button = document.createElement("button");
    setupButton(button, "add_tactic_button", strings.addButton);

    button.addEventListener("click", function () {
      addNewTactic().catch(console.error);
    });

    return button;
  }

  async function addNewTactic() {
    const outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    const tacticsDropdownMenu = document.getElementById(
      "tactics_dropdown_menu"
    );

    const tacticCoordinates = outfieldPlayers.map((player) => [
      parseInt(player.style.left),
      parseInt(player.style.top),
    ]);

    if (!validateTacticPlayerCount(outfieldPlayers)) {
      return;
    }

    const tacticId = generateUniqueId(tacticCoordinates);
    const isDuplicate = await validateDuplicateTactic(tacticId);
    if (isDuplicate) {
      alert(strings.duplicateTacticError);
      return;
    }

    const tacticName = prompt(strings.tacticNamePrompt);
    const isValidName = await validateTacticName(tacticName);
    if (!isValidName) {
      return;
    }

    const tactic = {
      name: tacticName,
      coordinates: tacticCoordinates,
      id: tacticId,
    };

    saveTacticToStorage(tactic).catch(console.error);
    addTacticsToDropdownMenu(tacticsDropdownMenu, [tactic]);
    dropdownMenuTactics.push(tactic);

    tacticsDropdownMenu.value = tactic.name;
    handleTacticsSelection(tactic.name);

    alert(strings.addAlert.replace("{}", tactic.name));
  }

  function validateTacticPlayerCount(outfieldPlayers) {
    const isGoalkeeper = document.querySelector(goalkeeperSelector);

    outfieldPlayers = outfieldPlayers.filter(
      (player) => !player.classList.contains("fieldpos-collision")
    );

    if (outfieldPlayers.length < minOutfieldPlayers || !isGoalkeeper) {
      alert(strings.invalidTacticError);
      return false;
    }

    return true;
  }

  async function validateDuplicateTactic(id) {
    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    return tacticsData.tactics.some((tactic) => tactic.id === id);
  }

  async function validateTacticName(name) {
    if (!name) {
      alert(strings.noTacticNameProvidedError);
      return false;
    }

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    if (tacticsData.tactics.some((t) => t.name === name)) {
      alert(strings.alreadyExistingTacticNameError);
      return false;
    }

    if (name.length > maxTacticNameLength) {
      alert(strings.tacticNameLengthError);
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
    setupButton(button, "delete_tactic_button", strings.deleteButton);

    button.addEventListener("click", function () {
      deleteTactic().catch(console.error);
    });

    return button;
  }

  async function deleteTactic() {
    const tacticsDropdownMenu = document.getElementById(
      "tactics_dropdown_menu"
    );

    const selectedTactic = dropdownMenuTactics.find(
      (tactic) => tactic.name === tacticsDropdownMenu.value
    );

    if (!selectedTactic) {
      alert(strings.noTacticSelectedError);
      return;
    }

    const confirmed = confirm(
      strings.deleteConfirmation.replace("{}", selectedTactic.name)
    );

    if (!confirmed) {
      return;
    }

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    tacticsData.tactics = tacticsData.tactics.filter(
      (tactic) => tactic.id !== selectedTactic.id
    );

    await GM_setValue("ls_tactics", tacticsData);

    dropdownMenuTactics = dropdownMenuTactics.filter(
      (tactic) => tactic.id !== selectedTactic.id
    );

    const selectedOption = Array.from(tacticsDropdownMenu.options).find(
      (option) => option.value === selectedTactic.name
    );
    tacticsDropdownMenu.remove(selectedOption.index);

    if (tacticsDropdownMenu.options[0]?.disabled) {
      tacticsDropdownMenu.selectedIndex = 0;
    }

    alert(strings.deleteAlert.replace("{}", selectedTactic.name));
  }

  // _____Rename tactic_____

  function createRenameTacticButton() {
    const button = document.createElement("button");
    setupButton(button, "rename_tactic_button", strings.renameButton);

    button.addEventListener("click", function () {
      renameTactic().catch(console.error);
    });

    return button;
  }

  async function renameTactic() {
    const tacticsDropdownMenu = document.getElementById(
      "tactics_dropdown_menu"
    );

    const selectedTactic = dropdownMenuTactics.find(
      (tactic) => tactic.name === tacticsDropdownMenu.value
    );

    if (!selectedTactic) {
      alert(strings.noTacticSelectedError);
      return;
    }

    const oldName = selectedTactic.name;

    const newName = prompt(strings.tacticNamePrompt);
    const isValidName = await validateTacticName(newName);
    if (!isValidName) {
      return;
    }

    const selectedOption = Array.from(tacticsDropdownMenu.options).find(
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

    dropdownMenuTactics = dropdownMenuTactics.map((tactic) => {
      if (tactic.id === selectedTactic.id) {
        tactic.name = newName;
      }
      return tactic;
    });

    selectedOption.value = newName;
    selectedOption.textContent = newName;

    const replacements = [oldName, newName];
    alert(strings.renameAlert.replace(/\{\}/g, () => replacements.shift()));
  }

  // _____Update tactic_____

  function createUpdateTacticButton() {
    const button = document.createElement("button");
    setupButton(button, "update_tactic_button", strings.updateButton);

    button.addEventListener("click", function () {
      updateTactic().catch(console.error);
    });

    return button;
  }

  async function updateTactic() {
    const outfieldPlayers = Array.from(
      document.querySelectorAll(outfieldPlayersSelector)
    );

    const tacticsDropdownMenu = document.getElementById(
      "tactics_dropdown_menu"
    );

    const selectedTactic = dropdownMenuTactics.find(
      (tactic) => tactic.name === tacticsDropdownMenu.value
    );

    if (!selectedTactic) {
      alert(strings.noTacticSelectedError);
      return;
    }

    const updatedCoordinates = outfieldPlayers.map((player) => [
      parseInt(player.style.left),
      parseInt(player.style.top),
    ]);

    const newId = generateUniqueId(updatedCoordinates);

    const tacticsData = (await GM_getValue("ls_tactics")) || { tactics: [] };
    const validationOutcome = await validateDuplicateTacticWithUpdatedCoord(
      newId,
      selectedTactic,
      tacticsData
    );

    switch (validationOutcome) {
      case "unchanged":
        return;
      case "duplicate":
        alert(strings.duplicateTacticError);
        return;
      case "unique":
        break;
      default:
        return;
    }

    const confirmed = confirm(
      strings.updateConfirmation.replace("{}", selectedTactic.name)
    );

    if (!confirmed) {
      return;
    }

    for (const tactic of tacticsData.tactics) {
      if (tactic.id === selectedTactic.id) {
        tactic.coordinates = updatedCoordinates;
        tactic.id = newId;
      }
    }

    for (const tactic of dropdownMenuTactics) {
      if (tactic.id === selectedTactic.id) {
        tactic.coordinates = updatedCoordinates;
        tactic.id = newId;
      }
    }

    await GM_setValue("ls_tactics", tacticsData);

    alert(strings.updateAlert.replace("{}", selectedTactic.name));
  }

  async function validateDuplicateTacticWithUpdatedCoord(
    newId,
    selectedTac,
    tacticsData
  ) {
    if (newId === selectedTac.id) {
      return "unchanged";
    } else if (tacticsData.tactics.some((tac) => tac.id === newId)) {
      return "duplicate";
    } else {
      return "unique";
    }
  }

  // _____Clear tactics_____

  function createClearTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "clear_tactics_button", strings.clearButton);

    button.addEventListener("click", function () {
      clearTactics().catch(console.error);
    });

    return button;
  }

  async function clearTactics() {
    const confirmed = confirm(strings.clearConfirmation);

    if (!confirmed) {
      return;
    }

    await GM_setValue("ls_tactics", { tactics: [] });
    dropdownMenuTactics = [];

    const tacticsDropdownMenu = document.getElementById(
      "tactics_dropdown_menu"
    );
    tacticsDropdownMenu.innerHTML = "";
    tacticsDropdownMenu.disabled = true;

    alert(strings.clearAlert);
  }

  // _____Reset default settings_____

  function createResetTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "reset_tactics_button", strings.resetButton);

    button.addEventListener("click", function () {
      resetTactics().catch(console.error);
    });

    return button;
  }

  async function resetTactics() {
    const confirmed = confirm(strings.resetConfirmation);

    if (!confirmed) {
      return;
    }

    const response = await fetch(defaultTacticsDataUrl);
    const data = await response.json();
    const defaultTactics = data.tactics;

    await GM_setValue("ls_tactics", { tactics: defaultTactics });
    dropdownMenuTactics = defaultTactics;

    const tacticsDropdownMenu = document.getElementById(
      "tactics_dropdown_menu"
    );
    tacticsDropdownMenu.innerHTML = "";
    tacticsDropdownMenu.appendChild(createPlaceholderOption());
    addTacticsToDropdownMenu(tacticsDropdownMenu, dropdownMenuTactics);
    tacticsDropdownMenu.disabled = false;

    alert(strings.resetAlert);
  }

  // _____Import/Export_____

  function createImportTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "import_tactics_button", strings.importButton);

    button.addEventListener("click", function () {
      importTactics().catch(console.error);
    });

    return button;
  }

  function createExportTacticsButton() {
    const button = document.createElement("button");
    setupButton(button, "export_tactics_button", strings.exportButton);
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
        dropdownMenuTactics = mergedTactics;

        const tacticsDropdownMenu = document.getElementById(
          "tactics_dropdown_menu"
        );
        tacticsDropdownMenu.innerHTML = "";
        tacticsDropdownMenu.append(createPlaceholderOption());
        addTacticsToDropdownMenu(tacticsDropdownMenu, dropdownMenuTactics);
        tacticsDropdownMenu.disabled = false;
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
    setupButton(button, "about_button", strings.aboutButton);

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

  function createTitle() {
    const title = document.createElement("h2");
    title.id = "info_modal_title";
    title.textContent = "MZ Tactics Selector";
    title.style.fontSize = "24px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "20px";
    return title;
  }

  function createInfoText() {
    const infoText = document.createElement("p");
    infoText.id = "info_modal_info_text";
    infoText.innerHTML = strings.modalContentInfoText;
    return infoText;
  }

  function createFeedbackText() {
    const feedbackText = document.createElement("p");
    feedbackText.id = "info_modal_feedback_text";
    feedbackText.innerHTML = strings.modalContentFeedbackText;
    return feedbackText;
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

  function setInfoModal() {
    infoModal = createInfoModal();
    document.body.appendChild(infoModal);
    document.addEventListener("click", function (event) {
      if (
        infoModal.style.display === "block" &&
        !infoModal.contains(event.target)
      ) {
        infoModal.style.display = "none";
      }
    });
  }

  // _____Audio button_____

  function createAudioButton() {
    const button = document.createElement("button");
    setupButton(button, "audio_button", "🔊");

    const audio = new Audio(
      "https://ia802609.us.archive.org/16/items/w-w-w-d-e-e-p-d-i-v-e-c-o-m-wg7bkk/Webinar%E2%84%A2%20-%20w%20w%20w%20.%20d%20e%20e%20p%20d%20i%20v%20e%20.%20c%20o%20m%20-%2002%20%E6%B3%A2.mp3"
    );
    audio.loop = true;

    button.addEventListener("click", function () {
      toggleAudio(audio);
    });

    return button;
  }

  function toggleAudio(audio) {
    audio.paused ? audio.play() : audio.pause();
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

  // _____Audio button_____

  function createAudioButton() {
    const button = document.createElement("button");
    setupButton(button, "audio_button", "♫");

    const audio = new Audio(
      "https://ia802609.us.archive.org/16/items/w-w-w-d-e-e-p-d-i-v-e-c-o-m-wg7bkk/Webinar%E2%84%A2%20-%20w%20w%20w%20.%20d%20e%20e%20p%20d%20i%20v%20e%20.%20c%20o%20m%20-%2002%20%E6%B3%A2.mp3"
    );
    audio.loop = true;

    button.addEventListener("click", function () {
      toggleAudio(audio);
    });

    return button;
  }

  function toggleAudio(audio) {
    audio.paused ? audio.play() : audio.pause();
  }

  // _____Language Dropdown Menu_____

  function createLanguageDropdownMenu() {
    const dropdown = document.createElement("select");
    setupDropdownMenu(dropdown, "language_dropdown_menu");

    for (const lang of languages) {
      const option = document.createElement("option");
      option.value = lang.code;
      option.textContent = lang.name;
      if (lang.code === activeLanguage) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    }

    dropdown.addEventListener("change", function () {
      changeLanguage(this.value).catch(console.error);
    });

    return dropdown;
  }

  async function changeLanguage(languageCode) {
    try {
      const translationDataUrl = `https://raw.githubusercontent.com/douglasdotv/tactics-selector/main/json/lang/${languageCode}.json?callback=?`;
      const translations = await (await fetch(translationDataUrl)).json();

      i18next.changeLanguage(languageCode);
      i18next.addResourceBundle(languageCode, "translation", translations);

      GM_setValue("language", languageCode);

      updateTranslation();

      const language = languages.find((lang) => lang.code === languageCode);
      if (language) {
        const flagImage = document.getElementById("language_flag");
        flagImage.src = language.flag;
      }
    } catch (err) {
      console.error(err);
    }
  }

  function updateTranslation() {
    for (const key in strings) {
      strings[key] = i18next.t(key);
    }

    for (const id in elementStringKeys) {
      const element = document.getElementById(id);
      if (id === "info_modal_info_text" || id === "info_modal_feedback_text") {
        element.innerHTML = strings[elementStringKeys[id]];
      } else {
        element.textContent = strings[elementStringKeys[id]];
      }
    }
  }

  function getActiveLanguage() {
    let language = GM_getValue("language");
    if (!language) {
      let browserLanguage = navigator.language || "en";
      browserLanguage = browserLanguage.split("-")[0];
      const languageExists = languages.some(
        (lang) => lang.code === browserLanguage
      );
      language = languageExists ? browserLanguage : "en";
    }
    return language;
  }

  // _____Other_____

  // note: apply Uxx filter was initially crafted by kostrzak16 (Yelonki). The applyUxxFilter() function is a slightly modified version of his code.
  function applyUxxFilter() {
    const minAge = 16;
    const maxAge = 21;
    let links = "";

    for (let i = minAge; i <= maxAge; ++i) {
      if (i !== minAge) {
        links += " ";
      }
      links += '<a href="#">' + i + "</a>";
    }

    $(".age-wrapper label").append(" " + links);

    let last = null;
    $(".age-wrapper label a").click(function () {
      const current = $(this).text().trim();

      if (last === current) {
        $("#age_from").val(current);
        $("#age_from").change();
      }

      $("#age_to").val(current);
      $("#age_to").change();

      if (parseInt($("#age_from").val()) > parseInt($("#age_to").val())) {
        $("#age_from").val($("#age_to").val());
        $("#age_from").change();
      }

      $("#filterSubmit").click();
      last = current;
    });
  }

  function isFootball() {
    const element = document.querySelector("div#tactics_box.soccer.clearfix");
    return !!element;
  }

  function appendChildren(parent, children) {
    children.forEach((ch) => {
      parent.appendChild(ch);
    });
  }

  function insertAfterElement(something, element) {
    element.parentNode.insertBefore(something, element.nextSibling);
  }

  function createTacticsSelectorDiv() {
    const div = document.createElement("div");
    setupTacticsSelectorDiv(div);
    return div;
  }

  function setupTacticsSelectorDiv(div) {
    div.id = "tactics_selector_div";
    div.style.width = "100%";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "stretch";
    div.style.marginTop = "6px";
    div.style.marginLeft = "6px";
  }

  function createRow(id) {
    const row = document.createElement("div");
    row.id = id;
    row.style.display = "flex";
    row.style.justifyContent = "flex-start";
    row.style.flexWrap = "wrap";
    row.style.width = "96%";
    return row;
  }

  function setupFirstRow() {
    const firstRow = document.getElementById("tactics_selector_div_first_row");
    firstRow.style.display = "flex";
    firstRow.style.justifyContent = "space-between";
    firstRow.style.width = "77%";

    const tacticsDropdownMenuLabel = createDropdownMenuLabel(
      "tactics_dropdown_menu_label"
    );
    const tacticsDropdownMenu = createTacticsDropdownMenu();
    const tacticsDropdownGroup = createLabelDropdownMenuGroup(
      tacticsDropdownMenuLabel,
      tacticsDropdownMenu
    );

    const languageDropdownMenuLabel = createDropdownMenuLabel(
      "language_dropdown_menu_label"
    );
    const languageDropdownMenu = createLanguageDropdownMenu();
    const languageDropdownGroup = createLabelDropdownMenuGroup(
      languageDropdownMenuLabel,
      languageDropdownMenu
    );

    appendChildren(firstRow, [tacticsDropdownGroup, languageDropdownGroup]);

    appendChildren(languageDropdownGroup, [createFlagImage()]);
  }

  function setupSecondRow() {
    const secondRow = document.getElementById(
      "tactics_selector_div_second_row"
    );

    const addNewTacticBtn = createAddNewTacticButton();
    const deleteTacticBtn = createDeleteTacticButton();
    const renameTacticBtn = createRenameTacticButton();
    const updateTacticBtn = createUpdateTacticButton();
    const clearTacticsBtn = createClearTacticsButton();
    const resetTacticsBtn = createResetTacticsButton();
    const importTacticsBtn = createImportTacticsButton();
    const exportTacticsBtn = createExportTacticsButton();
    const aboutBtn = createAboutButton();
    const audioBtn = createAudioButton();

    appendChildren(secondRow, [
      addNewTacticBtn,
      deleteTacticBtn,
      renameTacticBtn,
      updateTacticBtn,
      clearTacticsBtn,
      resetTacticsBtn,
      importTacticsBtn,
      exportTacticsBtn,
      aboutBtn,
      audioBtn,
    ]);
  }

  function createDropdownMenuLabel(labelId) {
    const label = document.createElement("span");
    setupDropdownMenuLabel(label, labelId, strings.languageDropdownMenuLabel);
    return label;
  }

  function createLabelDropdownMenuGroup(label, dropdown) {
    const group = document.createElement("div");
    group.style.display = "flex";
    group.appendChild(label);
    group.appendChild(dropdown);
    return group;
  }

  function setupDropdownMenu(dropdown, id) {
    dropdown.id = id;
    dropdown.style.fontSize = "12px";
    dropdown.style.fontFamily = "Montserrat, sans-serif";
    dropdown.style.border = "none";
    dropdown.style.borderRadius = "6px";
    dropdown.style.backgroundColor = "#11112e";
    dropdown.style.color = "#e5e4e2";
    dropdown.style.padding = "3px 6px";
    dropdown.style.margin = "6px 0 6px 6px";
    dropdown.style.cursor = "pointer";
    dropdown.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
    dropdown.style.outline = "none";
    dropdown.style.transition = "background-color 0.3s";

    dropdown.onmouseover = function () {
      dropdown.style.backgroundColor = "#334d77";
    };
    dropdown.onmouseout = function () {
      dropdown.style.backgroundColor = "#11112e";
    };
    dropdown.onfocus = function () {
      dropdown.style.outline = "2px solid #334d77";
    };
    dropdown.onblur = function () {
      dropdown.style.outline = "none";
    };
  }

  function setupDropdownMenuLabel(description, id, textContent) {
    description.id = id;
    description.textContent = textContent;
    description.style.fontFamily = "Montserrat, sans-serif";
    description.style.fontSize = "13px";
    description.style.color = "#11112e";
    description.style.margin = "6px 0 12px 6px";
  }

  function setupButton(button, id, textContent) {
    button.id = id;
    button.textContent = textContent;
    button.style.fontFamily = "Montserrat, sans-serif";
    button.style.fontSize = "12px";
    button.style.color = "#e5e4e2";
    button.style.backgroundColor = "#11112e";
    button.style.padding = "4px 8px";
    button.style.marginLeft = "6px";
    button.style.marginTop = "6px";
    button.style.cursor = "pointer";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
    button.style.fontWeight = "500";
    button.style.transition = "background-color 0.3s, transform 0.3s";

    button.onmouseover = function () {
      button.style.backgroundColor = "#334d77";
      button.style.transform = "scale(1.05)";
    };
    button.onmouseout = function () {
      button.style.backgroundColor = "#11112e";
      button.style.transform = "scale(1)";
    };
    button.onfocus = function () {
      button.style.outline = "2px solid #334d77";
    };
    button.onblur = function () {
      button.style.outline = "none";
    };
  }

  function createPlaceholderOption() {
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.text = "";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    return placeholderOption;
  }

  function createFlagImage() {
    const img = document.createElement("img");
    img.id = "language_flag";
    img.style.height = "15px";
    img.style.width = "25px";
    img.style.margin = "9px 0 6px 6px";
    const activeLang = languages.find((lang) => lang.code === activeLanguage);
    if (activeLang) {
      img.src = activeLang.flag;
    }
    return img;
  }

  function generateUniqueId(coordinates) {
    const sortedCoordinates = coordinates.sort(
      (a, b) => a[1] - b[1] || a[0] - b[0]
    );

    const coordString = sortedCoordinates
      .map((coord) => `${coord[1]}_${coord[0]}`)
      .join("_");

    return sha256Hash(coordString);
  }

  function sha256Hash(str) {
    const shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(str);
    const hash = shaObj.getHash("HEX");
    return hash;
  }
})();
