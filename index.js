import {
	Order,
	Customer,
	Item,
	Payment,
	NearbyStores,
	Tracking,
} from "dominos";

//extra cheese thin crust pizza
const pizza = new Item({
	//16 inch hand tossed crust
	code: "16SCREEN",
	options: {
		//sauce, whole pizza : normal
		X: { "1/1": "1" },
		//cheese, whole pizza  : double
		C: { "1/1": "1.5" },
		//pepperoni, whole pizza : double
		P: { "1/2": "1.5" },
	},
});

const customer = new Customer({
	address: "108 State St 5th Floor, Schenectady, NY 12305",
	firstName: "Darrin",
	lastName: "Jahnel",
	phone: "518-356-0039",
	email: "djahnel@jahnelgroup.com",
});

let storeID = 0;
let distance = 100;

//find the nearest store
const nearbyStores = new NearbyStores(customer.address);

//get closest delivery store
for (const store of nearbyStores.stores) {
	//inspect each store

	if (
		store.IsOnlineCapable &&
		store.IsDeliveryStore &&
		store.IsOpen &&
		store.ServiceIsOpen.Delivery &&
		store.MinDistance < distance
	) {
		distance = store.MinDistance;
		storeID = store.StoreID;
	}
}

if (storeID == 0) {
	throw ReferenceError("No Open Stores");
}

//create
const order = new Order(customer);

order.storeID = storeID;
order.addItem(pizza);
await order.validate();

//grab price from order and setup payment
const myCard = new Payment({
	amount: order.amountsBreakdown.customer,
	number: "4100-1234-2234-3234",
	expiration: "01/35",
	securityCode: "867",
	postalCode: "93940",
	tipAmount: 4,
});

order.payments.push(myCard);

try {
	await order.place();
	console.log("\n\nPlaced Order\n\n");

	const tracking = new Tracking();

	const trackingResult = await tracking.byPhone(customer.phone);
	console.log(trackingResult);
} catch (err) {
	console.log(
		"\n\nFailed Order Probably Bad Card, here is order.priceResponse the raw response from Dominos\n\n"
	);
}
