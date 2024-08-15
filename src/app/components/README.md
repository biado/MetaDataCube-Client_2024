# Components


A component is a group composed of a typescript, HTML and CSS (optional) file that corresponds to a part or all of the page visible in the browser. Each component has its own folder. Using components means you can separate different elements (to hide them, etc.), reuse them, etc.


In the interface, there are two main groups of components (the first two folders) in /components/ : Browsing-State and Cell-State, these two components correspond to the two pages of the interface.

___________________________________________________________________________________________________________

- [Components](#components)
  - [BrowsingStateComponent (/components/browsing-state)](#browsingstatecomponent-componentsbrowsing-state)
    - [CellsDisplayComponent (/components/browsing-state/cells-display)](#cellsdisplaycomponent-componentsbrowsing-statecells-display)
    - [CheckedElementsComponent (/components/browsing-state/checked-elements)](#checkedelementscomponent-componentsbrowsing-statechecked-elements)
    - [ConfigurationPopupComponent (/components/browsing-state/configuration-popup)](#configurationpopupcomponent-componentsbrowsing-stateconfiguration-popup)
    - [SelectionComponent (/components/browsing-state/selection)](#selectioncomponent-componentsbrowsing-stateselection)
  - [CellStateComponent (/components/cell-state)](#cellstatecomponent-componentscell-state)

_____


## BrowsingStateComponent (/components/browsing-state)

BrowsingStateComponent is the main component of the Browsing State page. This component contains everything you need to manage this page (what should or shouldn't be displayed at a given time, page changes, etc.). It contains all functionalities as well as the HTML header.

It contains the following components: *CellsDisplayComponent*, *ConfigurationPopupComponent*, *CheckedElementsComponent* and *SelectionComponent*.

### CellsDisplayComponent (/components/browsing-state/cells-display)

This is the component corresponding to the center of the page, which displays the table with the cells corresponding to the dimensions chosen in *SelectionComponent*. You can click on the cells to zoom in on them, to see all the media they contain.

### CheckedElementsComponent (/components/browsing-state/checked-elements)

This is the component on the right-hand side of the page, which will display a list of all selected elements. Selected items can be modified directly in this component.

### ConfigurationPopupComponent (/components/browsing-state/configuration-popup)

This is the component that corresponds to the configuration popup, which will be displayed when the user clicks on the configuration button (*BrowsingStateComponent*, in the header). It's in this component that you'll be able to choose whether to hide this or that element, as well as whether to transform a given tag list into a range selection.

### SelectionComponent (/components/browsing-state/selection)

This is the component on the left-hand side of the page, used to select elements as dimensions or filters. This component contains a search field, which can be used to narrow down the displayed list to the elements of interest. There's also a “clear Selection” button to delete the entire current selection. And of course, there's the selection list with checkboxes for choosing an element.

For the selection list, this component only handles the display of tagsets and hierarchies. For subsequent nodes, refer to the ***SelectionNodeComponent***. For tags in the “Tags” category, refer to ***SelectionTagComponent*** if you're selecting by checkbox, and ***SelectionTagByRangeComponent*** if you're selecting by range.


## CellStateComponent (/components/cell-state)
This is the component that corresponds to the CellState page. It displays all the images of a cell selected in *CellDisplayComponent*.

This component in itself serves as a link to its two internal components: ***CellStateGridComponent***, which displays the media in a large grid, and ***CellStateSingleComponent***, which displays a specific piece of media (with a tags button that displays all the tags assigned to that media).

If you click on a media item while in grid mode (*CellStateGridComponent*), you'll switch to single media mode (*CellStateSingleComponent*) with the clicked media item in view.
