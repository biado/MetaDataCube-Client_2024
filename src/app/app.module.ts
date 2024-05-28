import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DimensionsSelectionComponent } from './components/dimensions-selection/dimensions-selection.component';
import { FormsModule } from '@angular/forms';
import { GetDimensionsService } from './services/get-dimensions.service';


@NgModule({
  declarations: [
    AppComponent,
    DimensionsSelectionComponent
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
