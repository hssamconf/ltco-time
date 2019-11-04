import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/fr';

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
  enter: moment.Moment;
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
    this.enter = moment(hour, 'HH:mm');
    this.exit = this.enter.clone().add(+this.defaultHours, 'h').add(+this.defaultMinutes, 'm');
    this.timesList = [];
  }

  onAddSortieEntree(): void {
    if (this.exit) {
      this.timesList.push({enter: null, exit: null, icon: 'sunset', outLunch: false, exitDuration: 0});
    }
  }

  onRemoveSortieEntree(index: number): void {
    const deletedTime = this.timesList[index];
    if (deletedTime.enter === null || deletedTime.exit === null) {
      this.timesList.splice(index, 1);
      return;
    }

    if (deletedTime.exit.hour() >= 12 && deletedTime.exit.hour() <= 14) {
      if (deletedTime.outLunch) {
        const nbrOfExitMinutesBetween12And14 = this.timesList
          .filter(item => item.exit.hour() >= 12 && item.exit.hour() <= 14)
          .map(item => item.exitDuration)
          .reduce((prevItem, currentItem) => prevItem + currentItem, 0);
        this.exit.subtract(nbrOfExitMinutesBetween12And14 - 30, 'minutes');
      } else if (this.timesList.filter(item => item.outLunch === true).length > 0) {
        this.exit.subtract(deletedTime.exitDuration, 'minutes');
      }
    } else {
      this.exit.subtract(deletedTime.exitDuration, 'minutes');
    }
    this.timesList.splice(index, 1);

    console.log(this.timesList);
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
    this.makeCalculAndUpdateExitTime(currentTimes, index);
  }

  onReset() {
  }

  private makeCalculAndUpdateExitTime(currentTimes: Times, currentIndex: number): void {
    if (currentTimes.enter !== null && currentTimes.exit !== null) {
      console.log('calculating : ', currentTimes, 'with index : ', currentIndex);
      let nbrOfExitMinutes = currentTimes.enter.diff(currentTimes.exit, 'minutes');
      // on sauvegarde la duree sortie avant de faire le calcul ()
      this.timesList[currentIndex].exitDuration = nbrOfExitMinutes;

      // s'il est sortie entre midi et deux et qui na pas encore dejeuner
      if (currentTimes.exit.hour() >= 12 && currentTimes.exit.hour() <= 14
        && this.timesList.filter(item => item.outLunch === true).length === 0) {

        // on calcul la sommes des entrés/sorties entre midi et deux
        const nbrOfExitMinutesBetween12And14 = this.timesList
          .filter(item => item.exit.hour() >= 12 && item.exit.hour() <= 14)
          .map(item => item.exitDuration)
          .reduce((prevItem, currentItem) => prevItem + currentItem, 0);

        // si cette somme est superrieur ou egale a 30 en soustrait 30 des nombre dheurs sorties
        if (nbrOfExitMinutesBetween12And14 >= 30) {
          this.timesList[currentIndex].outLunch = true;
          this.timesList[currentIndex].icon = 'burger';
          nbrOfExitMinutes = nbrOfExitMinutesBetween12And14 - 30;
        } else if (nbrOfExitMinutes < 30) {
          nbrOfExitMinutes = 0;
        } else if (nbrOfExitMinutes >= 30) {
          this.timesList[currentIndex].outLunch = true;
          this.timesList[currentIndex].icon = 'burger';
          nbrOfExitMinutes -= 30;
        }
      }
      this.exit.add(nbrOfExitMinutes, 'minutes');
      console.log(this.timesList);
    }
  }
}
