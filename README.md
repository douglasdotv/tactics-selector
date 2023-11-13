# MZ Tactics Selector UserScript

![MZ Tactics Selector Screenshot](https://s1.ax1x.com/2023/06/11/pCVaPVH.png)

This is a UserScript designed specifically for the game [ManagerZone](https://www.managerzone.com/). It enhances user experience by introducing a dropdown menu on the tactics page, enabling one to select from a pre-defined list of tactics.

## Features

### Tactics Management
The userscript provides the following features:

- **Add Tactics**: come up with your own tactics and add them to the dropdown menu.
- **Delete Tactics**: remove tactics that you no longer need.
- **Rename Tactics**: update existing tactic names.
- **Update Tactics**: modify the (x, y) coordinates of an already existing tactic.
- **Clear Tactics**: remove all tactics from the dropdown menu.
- **Reset Tactics**: reset to default settings (fetches default tactics).
- **Export Tactics**: export the list of tactics into a json file (in case you want to share or reuse them in another browser or device, for example).
- **Import Tactics**: import a json file containing tactics (goes hand in hand with export tactics feature).

Each tactic is characterized by a name, an unique id and a set of coordinates.

### Local Storage
Data is persisted in the browser's local storage. This means that you can close the browser and open it again and your tactics will still be there. If you need to use the script in another browser or device, you can export your tactics and import them.

(Default tactics are always fetched from a json hosted in this GitHub Repository, but they are immediately stored in the local storage.)