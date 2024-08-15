# Services



A service is a piece of code, accessible by all interface elements and permanently loaded. This makes it possible to have variables, observables and functions common to several different components or services.

___________________________________________________________________________________________________________

- [Services](#services)
  - [FindElementService](#findelementservice)
  - [GetCellStateService](#getcellstateservice)
  - [GetCellsService](#getcellsservice)
  - [GetTagsetListService](#gettagsetlistservice)
  - [GetUrlToSelectedDimensionsOrCellStateService](#geturltoselecteddimensionsorcellstateservice)
  - [IndexedDbService](#indexeddbservice)
  - [SelectedCellStateService](#selectedcellstateservice)
  - [SelectedDimensionsService](#selecteddimensionsservice)
  - [SelectedFiltersService](#selectedfiltersservice)
  - [SelectionFunctionsService](#selectionfunctionsservice)
  - [UndoRedoService](#undoredoservice)


_____


## FindElementService

Service for finding an element in the Tagset list (from *GetTagsetListService*), but also for extending the parents of an element.

- **Function findElementinTagsetList** : Function for finding an element in the tagset list. All you need is the Id and type of the element you're looking for.

- **Function expandNodeParents** : Expand not only the node corresponding to the parentId in parameter, but also all the parents of this parent node, until all parents are expanded.

- **Function expandParentTagset** : Expand the tagset containing the node or tag in parameter.

- **Function expandParentTagList** : Expands the taglist in which the tag in parameter is located. 


## GetCellStateService
Service which, each time you click on a cell for which you want to see all the media, will launch itself (indirectly, it will wait for a url to be created thanks to *GetUrlToSelectedDimensionsOrCellStateService*, which will update its *selectedCellStatesWithUrl* observable, and this modification will launch this service's function). This service has an observable containing info on all the media in the cell we've zoomed in on.

- **Observable allMediasInfos** : This observable uses a list of MediaInfos objects, which contains everything we need to know about all the media in the *SelectedCellStateService* cell.

- **Function getAllMedias** : From the *SelectedCellState* url, this function will retrieve the list of all the media in the cell whose media we want to see. In addition to retrieving the media id and uri, we'll process the uri to find out which extension the media belongs to. If it's a link with a classic extension at the end, we'll retrieve this extension; if instead it's an Internet link not directly linked to an object, then we'll check whether it's a spotify or youtube link, as we accept these two cases too.


## GetCellsService

Service which, as soon as a new dimension or filter is selected (via the *SelectedFiltersService* & *SelectedDimensionsService* observables), retrieves everything required to display all result cells.

- **Observable AxisX** : This observable is used to obtain X axis graduations (only graduations with a resultant cell).

- **Observable AxisY** : this observable displays graduations on the Y axis (only graduations with a resultant cell).

- **Observable cellsContentUrl** : this observable contains, for a key (corresponding to the graduations of a cell), the url of the cell concerned. It's used here because it's the way the *CellsDisplayComponent* array locates the cells in the table.

- **Observable cellsContentCount** : This observable contains, for a key (corresponding to the graduations of a cell), the number of media in the cell concerned, as this is the way the *CellsDisplayComponent* array locates the cells in the table.

- **Function getCells** : This function takes the url present in the SelectedDimensions object retrieved previously and retrieves the response to this request from the server. If it succeeds, it will reset all variables and observables to 0 and then, for each element in the response, add the corresponding cell (as the server response is a list of cells). Next, it will retrieve the X and Y axis graduations and then update *cellsContentUrl* and *cellsContentCount* from the cell list.

- **Functions getAxisX & getAxisY** : These two functions retrieve the graduations of their respective axes according to the list of cells retrieved previously. Two cases: if the dimension is a tagset or a node.
	- If it's a tagset, we retrieve the tagset list from the server, sort it alphabetically (in the classic way: symbols < numbers < letters (aAbcDE...)) and keep only those elements that contain a cell (we know which element corresponds to which cell thanks to the cell coordinates (see Cells class)).
	
	- If it's a node, things are a little more complex. We retrieve the node's children (corresponding to the graduations). But when it comes to sorting, the server doesn't return a list sorted alphabetically as with tagset, but alphabetically as with SQL's OrderBy (which is different). A custom function must therefore be used. Once you've done this, you'll only keep the graduations that have a cell.


- **Function getCellsContent** : This function will take the list of cells obtained in *getCells*, and then, for each cell, create a key corresponding to its coordinate(s) (we use the names of the graduations linked to the coordinates, obtained just before thanks to *getAxisX* and *getAxisY*). Now that we have the key, we'll complete *cellsContentUrl* and *cellsContentCount*.

- **Function addCellToList** : Adds a cell to the cell list.

- **Function sql_OrderBy_Sort** : Allows you to sort a list of strings in the same way as SQL's OrderBy function.


## GetTagsetListService
This service allows you to create a tagset list, containing all tagsets, which contain tags, hierarchies, nodes, etc. This list will be set up as an observable, and all the application will be able to access it and modify the elements in it. This is the most important observable in the interface.

When the interface is first launched, the service will retrieve the entire list from the server and store it in the browser. As long as there's a version on the browser, the list will never be retrieved from the server again, unless the user clicks on the “Reload Data” button on the *Browsing-State page*.

- **Observable tagsetList** : Contains the tagset list (its importance is explained above).

- **Function loadTagsets** : This function retrieves the tagset list from the browser (using *IndexedDbService*).

- **Function sortTagsets** : sorts tagset alphabetically.

- **Function getTagsetList** : Main function for retrieving the tagset list. Will launch ***getTagsetInformations***, which will launch ***getTagsInformations*** and ***getHierarchyInformations***, which will launch ***getNodeInformations***.


## GetUrlToSelectedDimensionsOrCellStateService
This service simply adds the Url to *selectedDimensions* and *selectedCellState*. As soon as one of these elements is modified, or the filter list of *selectedFilters* is modified, then a function for each of these two cases will be called, and this will just create a new object, which contains the same thing as *selectedDimensions* or *selectedCellState*, but with the added url.
This is why services such as ***GetCellStateService*** or ***GetCellsService*** retrieve respectively *selectedCellStatesWithUrl* and *selectedDimensionsWithUrl* and not *selectedCellState* and *selectedDimensions*.


## IndexedDbService
This service simply adds and retrieves the tagset list from the *IndexedDB* database, which is on the vast majority of browsers.
For the record, every time we add a new list, we delete the old one.



## SelectedCellStateService
This service contains only the *selectedCellState* observable, which contains the information for the cell whose media you wish to view. This observable must be placed in a service so that it can be accessed at any time by the entire interface.



## SelectedDimensionsService 
This service contains only the *selectedDimensions* observable, which contains the dimensions currently selected. This observable must be placed in a service so that it can be accessed at any time by the entire interface.


## SelectedFiltersService
This service contains only the *filters* observable, which contains the currently selected filters. This observable must be placed in a service so that it can be accessed at any time by the entire interface.

## SelectionFunctionsService
This service contains the functions that are activated each time a box is ticked to select a dimension or filter. It also contains the observable that contains all the elements that are currently selected.

- **Observable checked_elements** : This observable allows you to have all the elements selected at all times (useful for *CheckedElementsComponent*).

- **constructor** : in the constructor, when retrieving *selectedDimensions* and filters observables, you can specify that the checked_elements observable will be updated with each new version.

- **Functions dimXSelected and dimYSelected** : called each time an element is selected as a dimension.

- **Functions tagFilterSelected, nodeFilterSelected, tagsetFilterSelected** : Functions called when, respectively, a tag, node or tagset is selected as filter.

- **Functions addFilter & removeFilter** : Functions that add or remove a filter from the filter list.

## UndoRedoService

This service is used to perform the **Undo** and **Redo** **functions**. 

There are 4 cases: the case where a dimension has been modified, the case where a filter has been modified, the case where a configuration has been modified and finally the case where a file has been loaded.
In each case, if you look at the components or other services, if we touch one of these cases, we'll use the “add” functions at the end of the file, which will add the elements to the necessary lists (these lists work like a history). Thanks to position variables, each undo and redo will move through the history (if you add an item when you're not at the end of the history, everything after the current item will be deleted).
