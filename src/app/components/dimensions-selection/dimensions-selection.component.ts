import { Component } from '@angular/core';
import { GetDimensionsService } from '../../services/get-dimensions.service';

@Component({
  selector: 'app-dimensions-selection',
  templateUrl: './dimensions-selection.component.html',
  styleUrl: './dimensions-selection.component.css'
})
export class DimensionsSelectionComponent {
  nodestosearch = '';


  constructor(
    private getDimensionsService: GetDimensionsService,
  ) { }

  elements: string[] = [
    "Abba", "Abbot", "Abbey", "Abbreviate", "Abbreviation",
    "Happening", "Happiness", "Happy", "Happen", "Haphazard",
    "Hack", "Hacker", "hackney", "Hackathon", "Hacked",
    "Hui", "huipil", "Huitlacoche",
    "Dog", "Doll", "Door", "Dove", "Dollar", 
    "Dot", "Document", "Double",
    "Diver", "Divine", "Divide", "Dinosaur"
  ];

  search_suggestion() {    
    console.log(this.elements.filter(element => element.startsWith(this.nodestosearch)));
  }

  async go() : Promise<void>{
    await this.getDimensionsService.getDimensions();
  }

  go2(){
    console.log(this.getDimensionsService.tagsetList);
  }

}
