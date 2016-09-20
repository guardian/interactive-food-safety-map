import {
	select
} from 'd3-selection'
import {
	selection
} from 'd3-selection-multi'
import {
	json
} from "d3-request"
import Awesomplete from 'awesomplete';
export default function LookupLocalAuthority(options) {

	let container=options.container;
	let list=options.list || [];

	let form=container.querySelector(".hp-location__form");
    let input=form.querySelector(".hp-madlib__input__text");
    let btn=form.querySelector(".hp-madlib__input__btn");
    new Awesomplete(input, {list: list});

    select(input)
    	.on("focus",()=>{
    		//console.log(event)
    		event.preventDefault();
    		console.log("FOCUS")
    	})
    	.on('awesomplete-selectcomplete', () => {
	    	console.log("!!!!")
	        //bean.fire(this.els.form, 'submit');
	    })

	select(form)
		.on("submit",(d)=>{

			event.preventDefault();

			console.log("SUBMIT")

			let inputboxVal = input.value;
            if (!inputboxVal) {
            	return;
            } else if (list.indexOf(inputboxVal) !== -1) {
                console.log("SHOW",inputboxVal);
                if(options.submitCallback) {
                	options.submitCallback(inputboxVal,"name")
                }
            }
            else { // not a constituency
            	let sanitizedPostcode = inputboxVal.toUpperCase().replace(/\s/g, '');
				let postcodeRegex = /^([A-Z][A-Z0-9]?[A-Z0-9]?[A-Z0-9]?[0-9][A-Z0-9]{2})$/i;
				if (postcodeRegex.test(sanitizedPostcode)) {
					let url = `https://interactive.guim.co.uk/2016/may/ukelex/postcodes/${sanitizedPostcode}.json`;
					//return json(url,callback());
					json(url,(data)=>{
						console.log("YES!",data)
						if(!data) {
							console.log("BOOOOOH")
							return;
						}
						console.log(inputboxVal,"->",data.adminDistrictCode)
						if(options.submitCallback) {
		                	options.submitCallback(data.adminDistrictCode,"id")
		                }
					})
				} else {
					console.log(`${sanitizedPostcode} (length ${sanitizedPostcode.length})`)
					console.log("WROOONG");
					//return new Promise((resolve, reject) => reject('Invalid postcode'));
				}
            }
		})
	select(btn)
		.on("click",()=>{
			select(form).dispatch("submit")
		})

}