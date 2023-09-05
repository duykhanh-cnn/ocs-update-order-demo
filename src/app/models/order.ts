import { OrderStatus } from "../enums/order-status";

function convertStatusJson(status: string): string {
	switch (status) {
		case 'order-waiting':
			return 'orderWaiting';
		case 'order-confirm':
			return 'orderConfirm';
		case 'order-shipping':
			return 'orderShipping';
		case 'order-complete':
			return 'orderComplete';
		case 'order-return':
			return 'orderReturn';
		case 'order-cancel':
			return 'orderCancel';
		default:
			return 'orderWaiting';
	}
}

function convertStatus(status: string): OrderStatus {
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

function formatMoneyVND(amount: number): string {
	let reversed = amount.toString().split('').reverse().join('');
	let dotted = reversed.replace(/(\d{3})(?=\d)/g, '$1.');
	return dotted.split('').reverse().join('');
}

function concatStores(line_items: Array<any>) {
	let stores = [];
	for (let item of line_items) {
		stores.push(item.product_data.store.vendor_shop_name);
	}
	let result = stores.join(', ');
	return result;
}

function getStatusTimeline(meta_data: Array<any>) {
	let value = null;
	for (let item of meta_data) {
		if (item.key === "_status_timeline") {
			value = item.value;
			break;
		}
	}
	let result = '';
	for (const status in value) {
		result += convertStatus(convertStatusJson(status)) + ': ' + value[status] + '\n';
	}
	return result.trim();
}

function getNameOrder(meta_data: Array<any>) {
	let value = null;
	for (let item of meta_data) {
		if (item.key === "_billing_wpge_name") {
			value = item.value;
			break;
		}
	}
	if (value == null) return "";
	return value.trim();
}

export class Order {
	id: number;
	name: string;
	date: Date;
	total: string;
	store: string;
	histories: string;
	status: string;
	
	constructor(order: any) {
		this.id = order.id;
		this.name = '#' + order.id + ' ' + getNameOrder(order.meta_data);
		this.date = new Date(order.date_created);
		this.total = formatMoneyVND(order.total) + ' ' + order.currency;
		this.store = concatStores(order.line_items);
		this.histories = getStatusTimeline(order.meta_data)
		this.status = convertStatusJson(order.status);
	}
}