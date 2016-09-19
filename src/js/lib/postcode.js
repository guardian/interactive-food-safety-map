import {
	json
} from 'd3-request';

export function postcodeLookup(postcode) {
	let sanitizedPostcode = postcode.toUpperCase().replace(/\s/g, '');
	let postcodeRegex = /^([A-Z][A-Z0-9]?[A-Z0-9]?[A-Z0-9]?[0-9][A-Z0-9]{2})$/i;
	if (postcodeRegex.test(sanitizedPostcode)) {
		let url = `https://interactive.guim.co.uk/2016/may/ukelex/postcodes/${sanitizedPostcode}.json`;
		return json(url);
	} else {
		console.log(`${sanitizedPostcode} (length ${sanitizedPostcode.length})`)
		return new Promise((resolve, reject) => reject('Invalid postcode'));
	}
}