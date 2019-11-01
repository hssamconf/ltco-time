import {AfterViewChecked, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/fr';
import {NgxMaterialTimepickerComponent} from 'ngx-material-timepicker';
import {Time} from '@angular/common';

moment.locale('fr');

interface Times {
  exit: moment.Moment;
  enter: moment.Moment;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {
  today: moment.Moment;
  defaultHours = '00';
  defaultMinutes = '00';
  exit: moment.Moment;
  timesList: Times[] = [];

  @ViewChild('times_container', {static: false})
  private myScrollContainer: ElementRef;

  ngOnInit(): void {
    // set today date
    this.today = moment();
    // set default work hours Lundi et Vendredi 8h30, Mardi au Jeudi 9h, week-and 0h
    if (this.today.day() === 1 || this.today.day() === 5) {
      this.defaultHours = '09';
    } else if (this.today.day() > 1 && this.today.day() < 5) {
      this.defaultHours = '09';
      this.defaultMinutes = '30';
    }
  }

  onSelectHour(hour: string): void {
    const enter = moment(hour, 'HH:mm');
    this.exit = enter.add(+this.defaultHours, 'h').add(+this.defaultMinutes, 'm');
  }

  onAddSortieEntree(): void {
    if (this.exit) {
      this.timesList.push({enter: null, exit: null});
      this.scrollToBottom();
    }
  }

  onRemoveSortieEntree(index: number): void {
    const deletedTime: Times[] = this.timesList.splice(index, 1);
    this.exit.subtract(deletedTime[0].enter.diff(deletedTime[0].exit, 'seconds'), 'seconds');
  }

  scrollToBottom(): void {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onSelectAdditionalTime(time: string, index: number, state: string) {
    if (state === 'enter') {
      this.timesList[index].enter = moment(time, 'HH:mm');
    } else {
      this.timesList[index].exit = moment(time, 'HH:mm');
    }

    if (this.timesList[index].enter !== null && this.timesList[index].exit !== null) {
      this.exit.add(this.timesList[index].enter.diff(this.timesList[index].exit, 'seconds'), 'seconds');
    }
  }
}
