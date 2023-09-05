import { Injectable } from '@angular/core';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { environment } from '../environments/environment';
import { from, map } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class WoocommerceService {
  private wooCommerce = new WooCommerceRestApi({
    url: environment.storeUrl,
    consumerKey: environment.consumerKey,
    consumerSecret: environment.consumerSecret,
    queryStringAuth: true,
    version: 'wc/v3'
  });

  constructor() { }

  getOrders() {    
    return from(this.wooCommerce.get('orders', {
      'per_page': 30
    })).pipe(
      map((result) => {
        return result.data;
      }));
  }

  updateOrderStatus(id: number,  status: string) {
    return this.wooCommerce.put(`orders/${id}`, {
      'status': status
    })
      .then(result => result)
      .catch((error) => {
        console.log("Response Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
      });
  }

}