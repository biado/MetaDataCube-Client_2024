import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowsingStateComponent } from './components/browsing-state/browsing-state.component';
import { CellStateComponent } from './components/cell-state/cell-state.component';

const routes: Routes = [
  { path: '', redirectTo: '/browsing-state', pathMatch: 'full' }, 
  { path: 'browsing-state', component: BrowsingStateComponent },
  { path: 'cell-state', component: CellStateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
