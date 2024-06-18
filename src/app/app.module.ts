import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GetTagsetListService } from './services/get-tagset-list.service';
import { DimensionsSelectionComponent } from './components/browsing-state/dimensions-selection/dimensions-selection.component';
import { DimensionsSelectionNodeComponent } from './components/browsing-state/dimensions-selection/dimensions-selection-node/dimensions-selection-node.component';
import { FiltersSelectionComponent } from './components/browsing-state/filters-selection/filters-selection.component';
import { CellsDisplayComponent } from './components/browsing-state/cells-display/cells-display.component';
import { FiltersSelectionTagComponent } from './components/browsing-state/filters-selection/filters-selection-tag/filters-selection-tag.component';
import { BrowsingStateComponent } from './components/browsing-state/browsing-state.component';
import { CellStateComponent } from './components/cell-state/cell-state.component';
import { AppRoutingModule } from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    DimensionsSelectionComponent,
    DimensionsSelectionNodeComponent,
    FiltersSelectionComponent,
    FiltersSelectionTagComponent,
    CellStateComponent,
    CellsDisplayComponent,
    BrowsingStateComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    GetTagsetListService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
