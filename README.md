# MetaDataCube

MetaDataCube is a web interface using the M3 model server. 

- Link to the M3 server :  https://github.com/Ok2610/PhotoCube-Server

- This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.8.
____

This part is separated into 3: a  "***User Documentation***" part, explaining how the interface was launched and the functionalities of it. The second part "***Documentation Explanation***" will explain how the documentation for this project works. And the last part is for the ideas for the future.

- [MetaDataCube](#metadatacube)
- [User Documentation](#user-documentation)
  - [Launch the Interface](#launch-the-interface)
  - [Browsing-State Page](#browsing-state-page)
    - [Header](#header)
    - [Selection (left part)](#selection-left-part)
    - [Configuration Popup](#configuration-popup)
    - [Cells Display](#cells-display)
  - [Cell-State Page](#cell-state-page)
    - [Grid Mode](#grid-mode)
    - [Single Mode](#single-mode)
- [Documentation Explanation](#documentation-explanation)
- [For the Future](#for-the-future)

----
# User Documentation
## Launch the Interface
- Clone the git directory : https://github.com/Yulgoat/MetaDataCube-Client_2024.git
- Go into the directory 
- `npm install`
- `npm start`
- In a browser, go to the corresponding localhost (http://localhost:4200 if nothing is already using it).

## Browsing-State Page
Initial page of the interface. This is the page that will allow you to select dimensions and filters, in order to see all the corresponding cells.

### Header
- In this part, there are buttons: Undo, Redo, Configuration, Reload Data, Save, Load
- Undo: allows to cancel the action performed, it works for a selection, a configuration item or a file.
- Redo: allows to redo the action.
- Configuration: Displays the Configuration pop-up (detailed below)
- Reload Data 
	- Allows you to reload the Selection list, useful if you have changed the database.
	- Indeed, this list will be loaded at the first launch of the interface and then stored in the browser, so if there are changes it will not be visible unless you press this button.
- Save: Allows you to download a json file, which contains the current selection and configuration.
- Load:  Allows to load a Json file that will take the selection and configuration of the json and put them as current selection and configuration.

### Selection (left part)
- This section allows you to select the dimensions and filters that you want to have, in order to display the corresponding cells.
- The list of items that can be selected is constructed as follows: 
	- First the tagset, which each contain a list of expandable “Tags”, which contains tags that are not present in the hierarchy(s).
	- Then, if the tagset contains it, there are the hierarchies of the tagset. All nodes and sheets in the hierarchy are present, just browse through the hierarchy (everything is reduced initially, you have to click on the “+” button to display the rest).
- Tagsets and nodes that are not sheets can be selected as dimensions and filters, while tags and sheet nodes cannot be selected as filter only.
- There can be only one element for a dimension. So two elements that serve as dimensions at the end (one for X, another for Y).
- The search field, indicated by “Search...” Displays only items starting with what is written inside (the parent of the item will also be displayed). The “Clear Selection” does not reset the search, for this you must delete what it has entered in the field.
- Speaking of the “Clear Selection” button, this one allows you to delete all selections at once.

### Configuration Popup
- Visible part	
	- Allows you to make some elements of the selection list (tagset, hierarchy or tag list) invisible in order to reduce the number of elements with which to work.
	- They are all visible initially (checkbox checked). To make an element invisible, simply uncheck it.
	- If a tagset is made invisible, then the hierarchies and the list of tags will be invisible as well. If they are all invisible and you decide to make a hierarchy visible, then the tagset will be made visible automatically.
- Part “Range”
	- Allows you to transform a list of tags into a selection by range. Only possible if all tags in the tag list can be converted to a numeric format.
	- Option not selected in the initial state.

### Cells Display 
- In this section, all the cells corresponding to the selected dimensions and filters will be displayed.
- A cell contains the display of the last media in its media list. It is possible to see the number of media in a cell just below the media display).
- To see all the media in a cell, just click on the cell (if it is an image, anywhere in the cell, if it is another element, you will have to click anywhere in the box other than on the media). You will be directed to the Cell-State page.
- If you have selected a node for one of the dimensions, you will see that the graduations on the axis are children of that node. If one of these child nodes contains children, you can click on the graduation to zoom in on this node and thus refine your search.

## Cell-State Page
Page where all media of the selected cell will be displayed. When you arrive on the page, you will be in grid mode. The arrow in the upper left will return you to the Browsing-State page.

### Grid Mode
- Allows you to view all media in a cell.
- If you click on one of the media, you will go in Single mode.

### Single Mode
- Allows you to focus on a single cell media.
- You can navigate between the different media using the arrows at the bottom.
- If you click on “Tags”, then a pop-up will appear and show you all the tags that the current media has.

# Documentation Explanation
The documentation in this github works in the following way: everything is distributed in README.md in the corresponding folders (so visible in git).

- **/src/README.md** : Explanation of/src/ (proxy.conf.json, /app/, /assets and style.css) + Informations on some technical elements of the interface as well as guides to add certain elements.

- **/src/app/README.md** : Explanation of app-rooting.module.ts and the three folders containing the application elements (components, models and services).

- **/src/app/components/README.md** : Explanations of the different components (their purpose, functions, etc...)

- **/src/app/models/README.md** : Explanations of the different models (their purpose, attributes, etc...)

- **/src/app/services/README.md** : Explanations of the different services (their purpose, functions, variables, etc...)


# For the Future

- Instead of loading spotify links each time, put the **Thumbnail** for *CellDisplayComponent* and *CellStateGridComponent* and load only the **spotify link (iframe)** in *CellStateSingleComponent*. For this, it will be necessary to retrieve the thumbnail of the server (normally at the same time as file_uri when fetching cells and media info from GetCellsService and GetCellStateService).

- Instead of checking each time whether each tag in the tagset’s tag list can be transformed into a number to make a selection by range, it should be checked in advance (when retrieving the tagset, or directly from the server) so that you can tell if the tagset type is numeric or otherwise. 

- Separate the save from the configuration and the selection when saving and loading a file (currently all in the same). Why not remove the possibility to do a undo/ redo on the configuration.

- For sorting the names of nodes (sql_OrderBy_Sort in GetCellsService), it is necessary to add the case of many characters (example of the "Location Name" hierarchy of the tagset "Location Name" with the LSC-22 database, where there are symbols like Č or Đ). Be careful, you have to check how the Psql OrderBy sorts these characters so that they are exactly in the same order.