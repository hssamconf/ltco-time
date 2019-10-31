import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  today: moment.Moment;
  defaultHours = '00';
  defaultMinutes = '00';
  exit: moment.Moment;

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

  onSelectHour(hour: string) {
    const enter = moment(hour, 'HH:mm');
    this.exit = enter.add(+this.defaultHours, 'h').add(+this.defaultMinutes, 'm');
  }
}
