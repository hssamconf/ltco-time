import {AfterViewChecked, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/fr';
import {NgxMaterialTimepickerComponent} from 'ngx-material-timepicker';

moment.locale('fr');

interface Times {
  exit: moment.Moment;
  enter: moment.Moment;
  icon: string;
  outLunch: boolean;
  exitDuration: number; // in minutes
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
    this.timesList = [];
  }

  onAddSortieEntree(): void {
    if (this.exit) {
      this.timesList.push({enter: null, exit: null, icon: 'sunset', outLunch: false, exitDuration: 0});
      this.scrollToBottom();
    }
  }

  onRemoveSortieEntree(index: number): void {
    const deletedTime: Times[] = this.timesList.splice(index, 1);
    if (deletedTime[0].enter !== null && deletedTime[0].exit !== null) {// todo
      this.exit.subtract(deletedTime[0].enter.diff(deletedTime[0].exit, 'seconds'), 'seconds');
      if (deletedTime[0].outLunch) {
        this.exit.add(30, 'minutes');
      }
    }
  }

  scrollToBottom(): void {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onSelectAdditionalTime(time: string, index: number, state: string) {

    const currentTimes: Times = this.timesList[index];

    if (state === 'enter') {
      currentTimes.enter = moment(time, 'HH:mm');
    } else {
      currentTimes.exit = moment(time, 'HH:mm');
    }

    // si on a l'entree et la sortie on calcul la duration et on met a jour la sortie prevue
    if (currentTimes.enter !== null && currentTimes.exit !== null) {
      let nbrOfExitMinutes = currentTimes.enter.diff(currentTimes.exit, 'minutes');
      this.timesList[index].exitDuration = nbrOfExitMinutes;

      console.log('nbrOfExitMinutes', nbrOfExitMinutes);
      if (currentTimes.exit.hour() >= 12 && currentTimes.exit.hour() <= 14
        && this.timesList.filter(item => item.outLunch === true).length === 0) {

        const nbrOfExitMinutesBetween12And14 = this.timesList
          .filter(item => item.exit.hour() >= 12 && item.exit.hour() <= 14)
          .map(item => item.exitDuration)
          .reduce((prevItem, currentItem) => prevItem + currentItem, 0);
        console.log('nfbOfExitMinutesBetween12And14', nbrOfExitMinutesBetween12And14);

        if (nbrOfExitMinutesBetween12And14 >= 30) {
          this.timesList[index].outLunch = true;
          this.timesList[index].icon = 'burger';
          nbrOfExitMinutes = nbrOfExitMinutesBetween12And14 - 30;
        } else if (nbrOfExitMinutes < 30) {
          nbrOfExitMinutes = 0;
        } else if (nbrOfExitMinutes >= 30) {
          this.timesList[index].outLunch = true;
          this.timesList[index].icon = 'burger';
          nbrOfExitMinutes -= 30;
        }
      }
      this.exit.add(nbrOfExitMinutes, 'minutes');
    }
  }

  onReset() {
  }
}
