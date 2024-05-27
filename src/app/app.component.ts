import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Element {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'PhotoCube-Client_2024';

  nodes = 8960
  y=27

  constructor(
  ) { }

  elements: Element[] = [];

  ngOnInit(): void {
    const names: string[] = [
      "YYield",
      "!exclamation",
      "#hashtag",
      "aLowercase",
      "bBase",
      "ZUppercase",
      "$dollar",
      "cri",
      "1number",
      "2digits",
      "BBBBB",
      "3three",
      "Athree",
      "(85("
    ];

    // Transforme la liste de noms en une liste d'objets avec id et name
    this.elements = names.map((name, index) => ({
      id: index + 1,
      name: name
    }));

    console.log('Before sorting:', this.elements);

    // Trie la liste par nom
    this.elements.sort((a, b) => a.name.localeCompare(b.name));

    console.log('After sorting:', this.elements);

    const number = 8

    console.log(this.elements.find(element => element.id === number)?.name)
   
  }


  getnodes() : void{
    console.log('hello')
  }
}
