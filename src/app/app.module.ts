import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkScrollableModule, ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { PinchZoomModule } from './pinch-zoom/pinch-zoom.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularResizeEventModule } from 'angular-resize-event';
import { NgxLongPress2Module } from 'ngx-long-press2';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { HomeComponent } from './home/home.component';
import { KinshipNodeComponent } from './kinship-node/kinship-node.component';
import { MenuComponent } from './menu/menu.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AddNewPeopleComponent } from './people-select/add-new-people/add-new-people.component';
import { PeopleItemComponent } from './people-select/people-item/people-item.component';
import { PeopleSelectComponent } from './people-select/people-select.component';
import { SearchComponent } from './people-select/search/search.component';
import { PinchZoomDirective } from './pinch-zoom.directive';
import { RelativeInfoComponent } from './relative-info/relative-info.component';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    SearchComponent,
    PeopleItemComponent,
    PeopleSelectComponent,
    AddNewPeopleComponent,
    RelativeInfoComponent,
    NotFoundComponent,
    HomeComponent,
    ChartComponent,
    KinshipNodeComponent,
    PinchZoomDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDialogModule,
    CdkScrollableModule,
    ScrollingModule,
    DragDropModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,
    HttpClientModule,
    NgxLongPress2Module,
    AngularResizeEventModule,
    PinchZoomModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
