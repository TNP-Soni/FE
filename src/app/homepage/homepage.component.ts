import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/allapis.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {
  items: any[] = [];
  isAdmin: boolean = false;
  isPopupOpen: boolean = false;
  isBookingPopupOpen: boolean = false;
  isEditMode: boolean = false;
  itemForm: FormGroup;
  bookingForm: FormGroup;
  currentItem: any = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', Validators.required]
    });

    this.bookingForm = this.fb.group({
      quantity: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.setAdminStatus();
    this.fetchItems();
  }

  ngOnDestroy() {}

  setAdminStatus() {
    this.isAdmin = (Number(localStorage.getItem('isAdmin')) === 1) ? true : false;
  }

  async fetchItems() {
    try {
      const response = await this.apiService.get('/get-items');
      this.items = response;
    } catch (error) {
      console.error('Error fetching items', error);
    }
  }

  openPopup(item: any = null) {
    this.isPopupOpen = true;
    this.isEditMode = !!item;
    this.currentItem = item;

    if (item) {
      this.itemForm.patchValue(item);
    } else {
      this.itemForm.reset();
    }
  }

  closePopup() {
    this.isPopupOpen = false;
    this.currentItem = null;
  }

  async saveItem() {
    if (this.itemForm.valid) {
      const itemData = this.itemForm.value;

      try {
        if (this.isEditMode) {
          await this.apiService.post('/update-item', { ...itemData, id: this.currentItem.id });
        } else {
          await this.apiService.post('/add-item', itemData);
        }
        this.fetchItems();
        this.closePopup();
      } catch (error) {
        console.error('Error saving item', error);
      }
    }
  }

  openBookingPopup(item: any) {
    this.isBookingPopupOpen = true;
    this.currentItem = item;
    this.bookingForm.reset();
  }

  closeBookingPopup() {
    this.isBookingPopupOpen = false;
    this.currentItem = null;
  }

  async bookItem() {
    if (this.bookingForm.valid) {
      const bookingData = this.bookingForm.value;
      try {
        await this.apiService.post('/book-items', { items: [{ id: this.currentItem.id, quantity: bookingData.quantity }] });
        this.fetchItems();
        this.closeBookingPopup();
      } catch (error) {
        console.error('Error booking item', error);
      }
    }
  }

  addItem() {
    this.openPopup();
  }

  editItem(item: any) {
    this.openPopup(item);
  }

  async deleteItem(item: any) {
    try {
      await this.apiService.post('/delete-item', { id: item.id });
      this.fetchItems();
    } catch (error) {
      console.error('Error deleting item', error);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/login']);
  }
}