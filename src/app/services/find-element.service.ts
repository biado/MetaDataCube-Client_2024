import { Injectable } from '@angular/core';
import { Tagset } from '../models/tagset';
import { Node } from '../models/node';
import { GetTagsetListService } from './get-tagset-list.service';
import { Tag } from '../models/tag';
import { Hierarchy } from '../models/hierarchy';

@Injectable({
  providedIn: 'root'
})
export class FindElement {

  tagsetList:Tagset[] = [];

  constructor(
    private getTagsetListService : GetTagsetListService,
  ) {
    this.getTagsetListService.tagsetList$.subscribe(data => {
      this.tagsetList = data;
    });
   }

  /**
   * Retrieves a node or tagset using the type and id of the element. This will retrieve the exact object from the tagsetList.
   * 
   * Contains an internal function  "findNodeById" which searches for the node (if the component is a node) in depth.
   */
  findElementinTagsetList(elementid: number, elementType: 'node' | 'tagset'): Tagset | Node | null {
    let element: Tagset | Node | null = null;
    
    for (const tagset of this.tagsetList) {
        if (elementType === 'tagset') {
            if (tagset.id ===  elementid) {
                element = tagset;
                break;
            }
        } 
        else if (elementType === 'node') {
            for (const hierarchy of tagset.hierarchies) {
                if (hierarchy.firstNode.id === elementid) {
                    element = hierarchy.firstNode;
                    break;
                } else {
                    const foundNode = findNodeById(hierarchy.firstNode, elementid);
                    if (foundNode) {
                        element = foundNode;
                        break;
                    }
                }
            }
        }
    }

    return element;
    

    function findNodeById(node: Node, id: number): Node | null {
      if (node.id === id) {
          return node;
      }  
      if (node.children) {
          for (const childNode of node.children) {
              const foundNode = findNodeById(childNode, id);
              if (foundNode) {
                  return foundNode;
              }
          }
      }  
      return null;
    }
  }

  /**
   * Function that extends all the parents of a node.
   */
  expandNodeParents(parentid: number|null): void {
    if(!(parentid===null)){
      const parent = this.findElementinTagsetList(parentid,'node');
      if(parent && parent.type==='node'){
        parent.isExpanded = true;
        this.expandNodeParents(parent.parentID);
      }
    }
  }

  /**
   * Function to find a filter (a tag) in the tagsetList.
   */
  findFilterinTagsetList(elementid: number, elementType: 'tagset' | 'tag' | 'node'):Tag|Tagset|Node|null{
    let element: Tagset | Tag | Node | null = null;
    
    for (const tagset of this.tagsetList) {
        if (elementType === 'tagset') {
            if (tagset.id ===  elementid) {
                element = tagset;
                break;
            }
        } 
        else if (elementType === 'tag') {
            for (const tag of tagset.tags) {
                if (tag.id === elementid) {
                    element = tag;
                    break;
                }
            }
        }
        else if (elementType === 'node') {
            element = this.findElementinTagsetList(elementid,elementType);
        }
    }

    return element;
  }

  /**
   * Function that extends all the parents of tag.
   */
  expandFitlerTagset(tag : Tag): void {
    if(!(tag.tagsetid===null)){
      const parentTagset = this.findElementinTagsetList(tag.tagsetid,'tagset');
      if(parentTagset){
        parentTagset.isExpanded=true;
      }
    }
  }

  /**
   * Function to find a taget or a hierarchy in the tagsetList.
   */
  findTagsetOrHerarchy(elementid: number, elementType: 'tagset' | 'hierarchy'):Hierarchy|Tagset|null{
    let element: Tagset | Hierarchy | null = null;
    
    for (const tagset of this.tagsetList) {
        if (elementType === 'tagset') {
            if (tagset.id ===  elementid) {
                element = tagset;
                break;
            }
        } 
        else if (elementType === 'hierarchy') {
            for (const hier of tagset.hierarchies) {
                if (hier.id === elementid) {
                    element = hier;
                    break;
                }
            }
        }
    }
  
    return element;
  }
}

