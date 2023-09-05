import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import { OrderStatus } from 'src/app/enums/order-status';
import { WoocommerceService } from 'src/app/services/woocommerce.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'ngbd-table-complete',
	standalone: true,
	imports: [
		NgFor,
		DecimalPipe,
		FormsModule,
		AsyncPipe,
		NgbTypeaheadModule,
		NgbdSortableHeader,
		NgbPaginationModule,
		NgIf,
		NgbDropdownModule,
		CommonModule
	],
	templateUrl: './table-complete.component.html',
	providers: [OrderService, DecimalPipe],
	styleUrls: ['./table-complete.component.css'],
})
export class NgbdTableComplete {
	Object = Object;
	OrderStatus = OrderStatus;

	orders$: Observable<Order[]>;; // declare a local variable to store the orders
	total$: Observable<number>;

	@ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

	constructor(public service: OrderService, private wooService: WoocommerceService) {
		this.orders$ = service.orders$;
		this.total$ = service.total$;
	}

	onSort({ column, direction }: SortEvent) {
		// resetting other headers
		this.headers.forEach((header) => {
			if (header.sortable !== column) {
				header.direction = '';
			}
		});

		this.service.sortColumn = column;
		this.service.sortDirection = direction;
	}

	// a method that edits an order
	updateOrderStatus(order: Order, status: string, statusText: string) {
		console.log('Editing order', status);
		if (order.status !== status) {
			this.wooService.updateOrderStatus(order.id, status).then(response => console.log(response));
			let root = <HTMLElement>document.getElementById('dropdownMenuButton' + order.id);
			root.innerHTML = statusText;
		}
	}
	
	convertStatus(status: string): OrderStatus {
		switch (status) {
			case 'orderWaiting':
				return OrderStatus.orderWaiting;
			case 'orderConfirm':
				return OrderStatus.orderConfirm;
			case 'orderShipping':
				return OrderStatus.orderShipping;
			case 'orderComplete':
				return OrderStatus.orderComplete;
			case 'orderReturn':
				return OrderStatus.orderReturn;
			case 'orderCancel':
				return OrderStatus.orderCancel;
			default:
				return OrderStatus.orderWaiting;
		}
	}

	camelToSnake(str: string): string {
		return str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
	}
}