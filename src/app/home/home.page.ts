import { CommonModule, NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonModal, IonItemSliding, IonItemOption, IonItemOptions, IonAlert, IonToast } from '@ionic/angular/standalone';
import { Task } from './task';
import { initializeApp } from "firebase/app";
import { getDatabase, set, ref, update, remove, onValue } from 'firebase/database';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, checkmark, trash } from 'ionicons/icons';

const firebaseConfig = {
  apiKey: "AIzaSyB7HWjwy4nYmZF-1PLPCcNiszHL1OuNfg8",
  authDomain: "ionicmodal.firebaseapp.com",
  projectId: "ionicmodal",
  storageBucket: "ionicmodal.appspot.com",
  messagingSenderId: "428939066811",
  appId: "1:428939066811:web:eb0e51a2c7f6a7bba6589e",
  measurementId: "G-XEPPMCLFXR"
};


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonToast, IonAlert, IonItemOptions, FormsModule, IonItemOption, IonItemSliding, IonInput, IonModal, NgFor, IonLabel, IonItem, IonIcon, IonButton, IonButtons, CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList],
})
export class HomePage {

  alertButtons = ['OK'];

  count: number = 0;
  tasks: Array<Task> = [];

  theNewTask: string|null = "";
  app = initializeApp(firebaseConfig);
  db = getDatabase(this.app);

  constructor(private toastController: ToastController) {
    addIcons({ add, checkmark, trash });
    const dataListRef = ref(this.db, 'tasks');
    onValue(dataListRef, (snapshot) => {
      const data = snapshot.val();
      this.tasks = [];
      if (data == null) return;
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        console.log('key:', key)
        const element = childSnapshot.val();
        console.log('element:', element)
        this.tasks.push({id: key, title: element.title, status: element.status});
      });
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color
    });
    toast.present();
  }

  addItem() {
    this.theNewTask = prompt("New task:",'');
    if (this.theNewTask != '') {
      this.count++;
      set(ref(this.db, 'tasks/' + this.count), {
        title: this.theNewTask,
        status: 'open'
      }).then( () => {
        alert("Data addedd succesfully");
      })
      .catch( (error) => {
        alert("Error");
        console.log(error);
      });
      //this.tasks.push({title: this.theNewTask, status: 'open'});
    }
  }

  cancel() {
    //this.modal.dismiss(null, 'cancel');
  }

  trackItems(index: number, itemObject: any) {
    return itemObject.title;
  }

  markAsDone(slidingItem: IonItemSliding, task: Task) {
    update(ref(this.db, 'tasks/' + task.id), {
      title: task.title,
      status: 'done'
    }).then( () => {
      //alert("Task mark as done succesfully");
      this.showToast('Task marked as done', 'success');
    })
    .catch( (error) => {
      alert("Error");
      console.log(error);
    })

    setTimeout( () => { slidingItem.close() }, 2);
  }

  async removeTask(slidingItem: IonItemSliding, task: Task) {
    remove(ref(this.db, 'tasks/' + task.id)).then( () => {
      //alert("Task deleted succesfully");
      this.showToast('Task removed successfully', 'danger');
    })
    .catch( (error) => {
      alert("Error");
      console.log(error);
    })
    setTimeout( () => { slidingItem.close() }, 2);
  }

  //Parte Modal

  @ViewChild(IonModal) modal: IonModal;

  message = '';
  newTaskTitle: string;

  cancelModal() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.newTaskTitle, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      const taskTitle = ev.detail.data;
      if (taskTitle && taskTitle.trim()) {
        set(ref(this.db, 'tasks/' + taskTitle), {
          title: taskTitle,
          status: 'open'
        })
      } else {
        alert("Task title cannot be empty.");
      }
    }
  }

}
