import { Component } from '@angular/core';
import { Filter } from '../../models/filter';
import { SelectedFiltersService } from '../../services/selected-filters.service';
import { SelectedDimensionsService } from '../../services/selected-dimensions.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent {
  filters:Filter[]=[];

  AxeXType:'node' | 'tagset' |null = null;
  AxeXID :number|null = null;

  AxeYType :'node' | 'tagset' |null = null;
  AxeYID :number|null = null;


  AxisX: string[] = ['Alpha', 'Charlie', 'Bravo'];
  AxisY: string[] = ['Delta', 'Foxtrot', 'Echo'];
  


  constructor(
    private selectedFiltersService : SelectedFiltersService,
    private selectedDimensionsService : SelectedDimensionsService,
  ){

  }

  async ngOnInit(): Promise<void> {
    this.AxisX.sort();
    this.AxisY.sort();
    
    this.selectedFiltersService.filters$.subscribe(data => {
      this.filters = data;
    });

    this.selectedDimensionsService.xid$.subscribe(data => {
      this.AxeXID = data;
    });

    this.selectedDimensionsService.xtype$.subscribe(data => {
      this.AxeXType = data;
    });

    this.selectedDimensionsService.yid$.subscribe(data => {
      this.AxeYID = data;
    });

    this.selectedDimensionsService.ytype$.subscribe(data => {
      this.AxeYType = data;
    });
  }
}
