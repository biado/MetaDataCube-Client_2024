# Models

The models directory contains the project's various classes.

Thanks to the class, it's possible to have objects containing a certain number of variables, which avoids having dozens of variables in a file to talk about the same thing. 
In this interface, it's also to have only one observable object to modify at a time (to avoid certain synchronization problems).

Each class contains attributes and a constructor. No internal functions.

Now let's take a look at the different classes and what their attributes correspond to (I invite you to have a look at the file anyway, as I won't be describing the types specifically).

[TOCM]

[TOC]

## Tag (tag.ts)

This class corresponds to a **tag** in the M3 model, with a few attributes enabling it to be managed in the application.

- name : Tag's Name
- id : Tag's Id
- tagsetID : Tag's Tagset's Id
- type : 'tag' -->A type attribute is added to differentiate elements when a variable can have several types.
- isChecked : True if the tag checkbox is checked, False otherwise. (Only one isChecked because a tag can only be a filter).

## Tagset (tagset.ts)

This class corresponds to a **tagset** in the M3 model, with a few attributes enabling it to be managed in the application.

- name : Tagset's Name
- id : Tagset's Id
- type : 'tagset' --> A type attribute is added to differentiate elements when a variable can have several types.
- hierarchies : List of all Tagset's hierarchies
- tagList : List of all Tagset's tags
- isCheckedX : True if the tagset has been chosen as X dimensions, False otherwise.
- isCheckedY : True if the tagset has been chosen as Y dimensions, False otherwise.
- isChekedFilters : True if the tagset has been chosen as a Filter, False otherwise.
- isVisible : Variable used to determine whether an element can be displayed or not (true --> displayed, false -> hidden). 
- isExpanded : Variable used to determine whether an element is extended or not (i.e. whether its children/lesser elements) will be displayed or not.

## TagList (tag-list.ts)

This class corresponds to a **list of tags**. Instead of making a simple Tag[], we make a separate class (which contains Tag[], but also other elements we wouldn't have had otherwise). It corresponds to "Tags" in the selection list (which is present first in a tagset).

- tags : Tag List
- tagsetID : TagList Tagset's Id
- type : 'tagList' --> A type attribute is added to differentiate elements when a variable can have several types.
- isVisible : Variable used to determine whether an element can be displayed or not (true --> displayed, false -> hidden). 
- isExpanded : Variable used to determine whether an element is extended or not (i.e. whether its children/lesser elements) will be displayed or not.
- asRange : Variable to determine whether a tagList should be a checkbox selection (each element a checkbox) or a range selection.

## Hierarchy (hierarchy.ts)

This class corresponds to a **hierarchy** in the M3 model, with a few attributes enabling it to be managed in the application.

- name : Hierarchy's Name
- id : Hierarchy's Id
- type : 'hierarchy' --> A type attribute is added to differentiate elements when a variable can have several types.
- tagsetID : Hierarchy's Tagset's Id
- rootNodeID : Hierarchy's FirstNode's Id
- firstNode : Hierarchy's FirstNode 
- isVisible : Variable used to determine whether an element can be displayed or not (true --> displayed, false -> hidden). 

## Node (node.ts)

This class corresponds to a **node** in the M3 model, with a few attributes enabling it to be managed in the application.

- name : Node's Name
- id : Node's Id
- type : 'node' --> A type attribute is added to differentiate elements when a variable can have several types.
- parentID : Node's parentNode's Id, can be null.
- tagsetID : Node's Tagset's Id
- children : List of nodes corresponding to the node's children, can be null.
- tagID : Id of the tag linked to the node.
- isExpanded : Variable used to determine whether an element is extended or not (i.e. whether its children/lesser elements) will be displayed or not.
- isCheckedX : True if the node has been chosen as X dimensions, False otherwise.
- isCheckedY : True if the node has been chosen as Y dimensions, False otherwise.
- isCheckedFilters : True if the node has been chosen as a Filter, False otherwise.
- isVisible : Variable used to determine whether an element can be displayed or not (true --> displayed, false -> hidden). 

## Filter (filter.ts)

This class corresponds to a **filter**. This object brings together the various elements that can be a filter under a common class.

One possible code improvement would be to delete this class and transform the filter list that is currently Filter[] into (Tagset|Tag|Node)[].

- id :  Id of assigned element 
- type :  Type of assigned element 
- element :  Assigned element 

## Cell (cell.ts)

This class corresponds to a **cell** return by the M3 server.  Corresponds to the attributes returned by the server during api/cell requests (without the &all=[]).

- xCoordinate : Cell X coordinates (corresponds to a tag or node name).
- yCoordinate : Cell Y coordinates (corresponds to a tag or node name).
- count : Number of media in the cell
- file_uri : Uri of the last media of the cell

## SelectedDimensions (selected-dimensions.ts)

Class containing the **choice of dimensions**. Class created to avoid sending several variables each time. With this class, we have a single observable variable shared by the entire application (thanks to the *SelectedDimensionsService*).

- xname : Name of the element selected for X.
- xid : Id of the element selected for X.
- xtype : Type of the element selected for X.
- isCheckedX : True if an X dimension already exists (an element has already been selected), False otherwise.
- elementX : Element chosen as X dimensions. Can be null.
- yname : Name of the element selected for Y.
- yid : Id of the element selected for Y.
- ytype : Type of the element selected for Y.
- isCheckedY : True if an Y dimension already exists (an element has already been selected), False otherwise.
- elementY : Element chosen as Y dimensions. Can be null.
- url : Url corresponding to the current dimensions (this url may also contain filters if any). See *GetUrlToSelectedDimensionsOrCellStateService* for more information).

## ActualSearchFile (actual-search-file.ts)

Class used when **saving a file**. We'll create an object of this type, transform it into a json file and download it.

- selectedDimensions : Object *SelectedDimensions* to save the current dimensions. 
- selectedFilters : List of all selected filters.
- configuration : Complex Attribute, coming from undo-redo.service, containing the history of each checked or unchecked configuration item. So, when you load the file, you can restore the same configuration by doing the same thing over again. We therefore have an object containing the checked/unchecked item and what has been checked (between isVisible or asRange).

## SelectedCellState (selected-cell-state.ts)

Class containing the **data for the cell for which you want to see all the media it contains**. (See *CellsDisplayComponant*, *GetCellStateService* and *GetUrlToSelectedDimensionsOrCellStateService*).

- xid : Id of the element corresponding to the X graduation in the cell.
- xtype : Type of the element corresponding to the X graduation in the cell.
- yid :Id of the element corresponding to the Y graduation in the cell.
- ytype : Type of the element corresponding to the Y graduation in the cell.
- url : Url to obtain all the cell's media from the server.

## MediaInfos (media-infos.ts)

Class containing **media information** (this class is only used by components of the cell-state page and by *GetCellStateService*).

- file_uri : Media's Uri.
- isLoading : True initially, changes to False if media is loaded.
- isError : False initially, changes to True if there is an error loading the media.
- mediaID : Media's Id. (Each media item in the database has an ID, which is returned by the server and stored here).
- extension : File extension (see *GetCellStateService* for the different extension cases).
