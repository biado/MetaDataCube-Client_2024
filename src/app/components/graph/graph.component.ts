import { Component } from '@angular/core';
import { Filter } from '../../models/filter';
import { SelectedFiltersService } from '../../services/selected-filters.service';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';
import { GetGraphService } from '../../services/get-graph.service';
import { SelectedAxis } from '../../models/selected-axis';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})

export class GraphComponent {
  filters:Filter[]=[];

  selectedAxis : SelectedAxis = new SelectedAxis();

  AxisX: string[] = [];
  AxisY: string[] = [];
  
  content: { [key: string]: string } = {};

  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
    private getGraphService : GetGraphService,
  ){}

  async ngOnInit(): Promise<void> {
    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });

    this.selectedDimensionsService.selectedAxis$.subscribe(data => {
      this.selectedAxis = data;
    });

    this.getGraphService.AxisX$.subscribe(async data => {
      this.AxisX = data;
    });

    this.getGraphService.AxisY$.subscribe(async data => {
      this.AxisY = data;
    });

    this.getGraphService.content$.subscribe(async data => {
      this.content = data;
    });

  }


  getContent(x: string, y: string): string {
    return this.content[`${x}-${y}`] || '';
  }
}
