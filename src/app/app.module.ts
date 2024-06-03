import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DimensionsSelectionComponent } from './components/dimensions-selection/dimensions-selection.component';
import { FormsModule } from '@angular/forms';
import { GetDimensionsService } from './services/get-dimensions.service';
import { DimensionsSelectionNodeComponent } from './components/dimensions-selection/dimensions-selection-node/dimensions-selection-node.component';
import { FiltersSelectionComponent } from './components/filters-selection/filters-selection.component';
import { FiltersSelectionTagComponent } from './components/filters-selection/filters-selection-tag/filters-selection-tag.component';
import { GraphComponent } from './components/graph/graph.component';


@NgModule({
  declarations: [
    AppComponent,
    DimensionsSelectionComponent,
    DimensionsSelectionNodeComponent,
    FiltersSelectionComponent,
    FiltersSelectionTagComponent,
    GraphComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    GetDimensionsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
