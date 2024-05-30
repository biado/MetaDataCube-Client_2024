import { Injectable } from '@angular/core';
import { Tagset } from '../models/tagset';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private dbName = 'TagsetDB';
  private storeName = 'tagsets';
  private db!: IDBDatabase;

  constructor() {
    if (typeof indexedDB !== 'undefined') {
      this.openDatabase();
    } else {
      //console.error('IndexedDB is not supported or not available.');
    }
  }

  private openDatabase(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onerror = (event) => {
      console.error('Database error:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  }

  storeTagsets(tagsetList: Tagset[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject('Database is not initialized1');
      }
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      store.clear(); // Clear existing data

      tagsetList.forEach((tagset, index) => {
        store.put({ id: index + 1, data: tagset });
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        reject(event);
      };
    });
  }

  retrieveTagsets(): Promise<Tagset[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject('Database is not initialized');
      }
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const result = getAllRequest.result.map(item => item.data);
        resolve(result);
      };

      getAllRequest.onerror = (event) => {
        reject(event);
      };
    });
  }
}
