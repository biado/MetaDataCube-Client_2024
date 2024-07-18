import { Component } from '@angular/core';
import { Tagset } from '../../../models/tagset';
import { Node } from '../../../models/node';
import { Filter } from '../../../models/filter';
import { Tag } from '../../../models/tag';
import { GetTagsetListService } from '../../../services/get-tagset-list.service';
import { SelectedDimensionsService } from '../../../services/selected-dimensions.service';
import { SelectedFiltersService } from '../../../services/selected-filters.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { Hierarchy } from '../../../models/hierarchy';

@Component({
  selector: 'app-filters-selection',
  templateUrl: './filters-selection.component.html',
  styleUrl: './filters-selection.component.css'
})
export class FiltersSelectionComponent { 
  filterstosearch = '';
  tagsetlist: Tagset[] = [];

  filtersList : Filter[]=[];

  nodesTagIDList : number[] = [];

  constructor(
    private getTagsetListService: GetTagsetListService,                   // Service that will obtain the list of tagset
    protected selectedDimensionsService:SelectedDimensionsService,        // Service containing information on selected dimensions
    private selectedFiltersService:SelectedFiltersService,                 // Service containing information on selected filters
    private undoredoService : UndoRedoService,
  ) 
  {}

  /**
   * When the component is started, we get a list of all the tagset.
   */
  async ngOnInit(): Promise<void> {
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetlist = data;
      this.getNodesTagId();
    });

    this.selectedFiltersService.filters$.subscribe(data =>{
      this.filtersList = data;
    })
  }

  /**
   * When a tag (filters-selection-tags.component) is selected, 
   * it will send a signal to this component, which will launch this function. 
   * 
   * Depending on whether the tag has been selected or deselected, we will call the add function of the service or the remove function.
   */
  onTagFilterSelected(tag: Tag) {
    tag.ischecked = !tag.ischecked;
    if (tag.ischecked) {
      this.addFilter(tag.id,tag.type,tag);
    } else {
      this.removeFilter(tag.id,tag.type);
    }
  }
  
  /**
   * When a node (filters-selection-nodes.component) is selected, 
   * it will send a signal to this component, which will launch this function. 
   * 
   * Depending on whether the node has been selected or deselected, we will call the add function of the service or the remove function.
   */
  onNodeFilterSelected(node: Node) {
    node.isCheckedFilters = !node.isCheckedFilters;
    if (node.isCheckedFilters) {
      this.addFilter(node.id,node.type,node);
    } else {
      this.removeFilter(node.id,node.type);
    }
  }

  /**
   * Function launched when a tagset is selected or deselected as a filter. 
   * 
   * If the tagset is selected, we call add function of the service, 
   * if it is deselected, it is the remove function.
   */
  toggleCheckboxTagsetFilters(tagset:Tagset): void {
    tagset.isCheckedFilters = !tagset.isCheckedFilters;

    if (tagset.isCheckedFilters) {
      this.addFilter(tagset.id,tagset.type,tagset);
    } else {
      this.removeFilter(tagset.id,tagset.type);
    }
  }

  /**
   *  Function to retrieve all tagId present in the nodes of the tagset hierarchies.
   * 
   * Allows you to see which tagId is not present in this site, so you know which tag is not in a node.
   */
  getNodesTagId(){
    this.tagsetlist.forEach(tagset=>{
      tagset.hierarchies.forEach(hierarchy=>{
        getTagId(hierarchy.firstNode,this.nodesTagIDList);
      })
    })
    console.log("afff")
    function getTagId(node:Node,nodesTagIDList:number[]){
      nodesTagIDList.push(node.tagId);

      if(node.children && node.children.length>0){
        node.children.forEach(childNode=>{
          getTagId(childNode,nodesTagIDList);
        })
      }
    }
  }

  /**
   * Retrieves the list of tags not present in a tagset's hierarchy nodes.
   */
  getTagsetTagList(tagset : Tagset):Tag[]{
    let tags : Tag[] = [];

    tagset.tags.forEach(tag=>{
      if(!(this.nodesTagIDList.includes(tag.id))){
        tags.push(tag);
      }
    })

    return tags;
  }

  /**
   * Add a filter to the filters List
   */
  addFilter(id: number, type: 'tagset'|'tag'|'node',element:Tag|Tagset|Node): void {
    const filter = new Filter(id, type,element);

    const newfiltersList : Filter[]=[];
    this.filtersList.forEach(filter=>{
      newfiltersList.push(filter);
    });
    newfiltersList.push(filter);
    
    this.filtersList = newfiltersList;

    this.undoredoService.addFilterAction(this.filtersList);     //Add the Action to the UndoRedoService
    this.selectedFiltersService.filtersSubject.next(this.filtersList);
  }

  /**
   * Remove a filter from the filters List
   */
  removeFilter(id: number, type: 'tagset'|'tag'|'node'): void {
    let element: Filter | null = null;

    const currentFilters = this.filtersList;
    currentFilters.forEach(elt => {
      if (elt.type === type && elt.id === id) {
        element = elt;
      }
    });

    if (element !== null) {
      const updatedFilters = currentFilters.filter(f => f !== element);
      this.filtersList = updatedFilters;
      this.undoredoService.addFilterAction(updatedFilters);     //Add the Action to the UndoRedoService
      this.selectedFiltersService.filtersSubject.next(updatedFilters);
    }
  }

  /**
   * Clear the filters List
   */
  clearFiltersSelection(): void {
    console.log("\n ListFilters : ", this.filtersList);
    this.filtersList.forEach(elt => {
      if(elt.element.type==="tag"){
        elt.element.ischecked = false;
      }
      else{
        elt.element.isCheckedFilters = false;
      }
    });

    this.tagsetlist.forEach(tagset => {
      tagset.hierarchies.forEach(hierarchy => {
          const nodesToProcess: Node[] = [hierarchy.firstNode];
          const allNodes: Map<number, Node> = new Map();

          while (nodesToProcess.length > 0) {
              const currentNode = nodesToProcess.pop()!;
              allNodes.set(currentNode.id, currentNode); 
              if (currentNode.children) {
                  nodesToProcess.push(...currentNode.children);
              }
          }

          allNodes.forEach(node => node.isExpandedFilters = false);
      });
      tagset.isTagListExpanded = false;
      tagset.isExpandedFilters = false;
    });

    this.filtersList = [];
    this.undoredoService.addFilterAction([]);     //Add the Action to the UndoRedoService
    this.selectedFiltersService.filtersSubject.next([]);
  }

  /**
   * Sort a hierarchy list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortHierarchy(hierarchy: Hierarchy[]): Hierarchy[] {
    return hierarchy.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
  * Sort a Tag list alphabetically (Symbol -> Number ->aAbCdDeF).
  */
  sortTags(tags: Tag[]): Tag[] {
    return tags.sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
  }

  /**
   * Two next function sort a node list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortNodes(nodes: Node[]): Node[] {
    return nodes.sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
  }
  sortNodeChildren(node:Node):Node[]{
    if (!node || !node.children || node.children.length === 0) {
      return [];    
    }
    let sortedChildren = this.sortNodes(node.children);    
    return sortedChildren;
  }

  /**
   * Function to search for the tag / node / tagset whose name matches what is marked in the search field.
   */
  search_Filters(): void {

    // Function to reset all tags/tagset to isExpanded = false and isVisible = true
    function resetSearch(tagsets: Tagset[]):void{
      tagsets.forEach(tagset => {
        tagset.isVisibleFilters = true;
        tagset.isExpandedFilters = false;
        tagset.tags.forEach(tag=>{
          tag.isVisible = true;
        });
        tagset.hierarchies.forEach(hierarchy => {
          hierarchy.isVisible = true;
          const nodesToProcess: Node[] = [hierarchy.firstNode];
          while (nodesToProcess.length > 0) {
            const currentNode = nodesToProcess.pop()!;
            currentNode.isExpandedFilters = false;
            currentNode.isVisibleFilters = true;
            if (currentNode.children) {
              nodesToProcess.push(...currentNode.children);
            }
          }
        });
      });
    }

    // Recursive function to mark parents as isExpanded and isVisible
    function expandParents(node: Node, allNodes: Map<number, Node>): void {
        if (node.parentID !== null) {
            const parent = allNodes.get(node.parentID);
            if (parent) {
                parent.isExpandedFilters = true;
                parent.isVisibleFilters = true;
                expandParents(parent, allNodes);
            }
        }
    }

    // Recursive function to mark children Visible
    function childrenVisible(node:Node, toSearch : string){
      if(node.children && node.children.length > 0){
        node.children.forEach(child =>{
          child.isVisibleFilters = true;
          if (!(child.name.startsWith(toSearch))) {
            child.isExpandedFilters = false;
          }
          childrenVisible(child,toSearch);
        })
      }
    }

    // Reset all nodes if nodestosearch is empty
    if (this.filterstosearch === '') {
      resetSearch(this.tagsetlist);
      return;
    }

    // We go through the tagset list to retrieve items starting with nodetosearch and display them.
    this.tagsetlist.forEach(tagset => {
      tagset.isVisibleFilters = false; 
      if(tagset.name.toString().startsWith(this.filterstosearch)){
        tagset.isVisibleFilters = true;
      }

      this.getTagsetTagList(tagset).forEach(tag => {
        tag.isVisible = false; 
          if (tag.name.toString().startsWith(this.filterstosearch)) {
            tag.isVisible = true;
  
            // Display the tagset of the corresponding tag
            tagset.isExpandedFilters = true;
            tagset.isVisibleFilters = true;
          }
      });


      tagset.hierarchies.forEach(hierarchy => {
        hierarchy.isVisible = false; // Hide default hierarchies
        const nodesToProcess: Node[] = [hierarchy.firstNode];
        const allNodes: Map<number, Node> = new Map();

        if(hierarchy.name.startsWith(this.filterstosearch)){
          hierarchy.isVisible = true;
        }

        // Map of all the nodes
        while (nodesToProcess.length > 0) {
            const currentNode = nodesToProcess.pop()!;
            allNodes.set(currentNode.id, currentNode); 
            if (currentNode.children) {
                nodesToProcess.push(...currentNode.children); // Adding children to the process
            }
        }

        // Hide all nodes 
        allNodes.forEach(node => node.isVisibleFilters = false);

        // Search for nodes that are parents and whose name begins with nodestosearch
        // If there is a match, we display the node and its parent nodes (and hierarchy and tagset)
        allNodes.forEach(node => {
          if (node.name.startsWith(this.filterstosearch)) {
            node.isExpandedFilters = true;
            node.isVisibleFilters = true;
            childrenVisible(node, this.filterstosearch);
            expandParents(node, allNodes);

            // Display the hierarchy and tagset of the corresponding node
            hierarchy.isVisible = true;
            tagset.isVisibleFilters = true;
            tagset.isExpandedFilters = true;
          }          
        });
      });
    }); 
  }

}
