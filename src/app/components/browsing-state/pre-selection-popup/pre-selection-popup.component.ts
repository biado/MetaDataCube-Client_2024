import { Component, EventEmitter, Output } from '@angular/core';
import { Tagset } from '../../../models/tagset';
import { Node } from '../../../models/node';
import { SelectedDimensions } from '../../../models/selected-dimensions';
import { GetTagsetListService } from '../../../services/get-tagset-list.service';
import { Hierarchy } from '../../../models/hierarchy';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { TagList } from '../../../models/tag-list';
import { Tag } from '../../../models/tag';

@Component({
  selector: 'app-pre-selection-popup',
  templateUrl: './pre-selection-popup.component.html',
  styleUrl: './pre-selection-popup.component.css'
})
export class PreSelectionPopupComponent {

  @Output() close_popup_event = new EventEmitter();

  tagsetlist: Tagset[] = [];

  selectedDimensions : SelectedDimensions = new SelectedDimensions();


  constructor(
    private getTagsetListService: GetTagsetListService,        
    private undoRedoService : UndoRedoService,
  ) 
  {}

  /**
   * When the component is started, we get a list of all the tagset.
   */
  async ngOnInit(): Promise<void> {
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetlist = data;
    });
  }

  /**
   * Sort a hierarchy list alphabetically (Symbol -> Number ->aAbCdDeF)
   */
  sortHierarchy(hierarchy: Hierarchy[]): Hierarchy[] {
    return hierarchy.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Send a signal to browsingState Component to close the pop-up
   */
  close_popup() : void {
    this.close_popup_event.emit();
  }

  /**
   * Function launched when a tagset checkbox is updated
   */
  check_tagset(tagset : Tagset){
    let modified_elements : ({element : Hierarchy|Tagset|TagList, preselectionType:'isVisible'|'asRange'})[] = [];

    tagset.hierarchies.forEach(hierarchy => {
      if((hierarchy.isVisible === tagset.isVisible)){
        hierarchy.isVisible = !hierarchy.isVisible;
        modified_elements.push({element : hierarchy, preselectionType:'isVisible'});
      }
    })

    if(tagset.tagList.isVisible === tagset.isVisible){
      tagset.tagList.isVisible = !tagset.tagList.isVisible;
      modified_elements.push({element : tagset.tagList, preselectionType:'isVisible'})
    }

    tagset.isVisible = !tagset.isVisible;
    modified_elements.push({element : tagset, preselectionType:'isVisible'});

    this.undoRedoService.addPreSelectionAction(modified_elements);
  }

  /**
   * Function launched when a tagset checkbox is updated
   */
  check_tagsList(tagsList : TagList,tagset : Tagset){
    let modified_elements : ({element : Hierarchy|Tagset|TagList, preselectionType:'isVisible'|'asRange'})[] = [];
    
    tagsList.isVisible = !tagsList.isVisible;
    modified_elements.push({element : tagsList, preselectionType:'isVisible'});

    if(tagsList.isVisible){
      tagset.isVisible = true;
      modified_elements.push({element : tagset, preselectionType:'isVisible'});
    }

    this.undoRedoService.addPreSelectionAction(modified_elements);
  }

  /**
   * Function launched when a hierarchy checkbox is updated
   */
  check_hierarchy(hierarchy: Hierarchy,tagset : Tagset){
    let modified_elements : ({element : Hierarchy|Tagset|TagList, preselectionType:'isVisible'|'asRange'})[] = [];
    
    hierarchy.isVisible = !hierarchy.isVisible;
    modified_elements.push({element : hierarchy, preselectionType:'isVisible'});

    if(hierarchy.isVisible){
      tagset.isVisible = true;
      modified_elements.push({element : tagset, preselectionType:'isVisible'});
    }

    this.undoRedoService.addPreSelectionAction(modified_elements);
  }

  /**
   * Function lauchend when we select a Tags Categorie as a range filter
   */
  check_tagsList_as_Range(tagsList : TagList,tagset : Tagset){
    let modified_elements : ({element : Hierarchy|Tagset|TagList, preselectionType:'isVisible'|'asRange'})[] = [];
    
    tagsList.asRange = !tagsList.asRange;
    modified_elements.push({element : tagsList, preselectionType:'asRange'});

    this.undoRedoService.addPreSelectionAction(modified_elements);
  }

  /**
   * Function that checks whether all the elements in the tag list can be transformed into numbers.
   */
  tagsNameToNumbersIsPossible(tags: Tag[]): boolean {
    for (const tag of tags) {
        const numberValue = Number(tag.name);
        if (isNaN(numberValue)) {
          return false;
        }
    }
    return true;
  }

}
