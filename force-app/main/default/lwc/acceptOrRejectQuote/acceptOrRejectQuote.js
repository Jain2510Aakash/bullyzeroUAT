import { LightningElement } from 'lwc';
import updateQuote from '@salesforce/apex/AcceptOrRejectQuoteCtrl.updateQuote';

export default class AcceptOrRejectQuote extends LightningElement {
    quoteId;

    connectedCallback() {
        if (this.quoteId == null || this.quoteId == undefined) {
            const param = 'Id';
            const paramValue = this.getUrlParamValue(window.location.href, param);
            this.quoteId = paramValue;
        }

        updateQuote({
            quoteId: this.quoteId,
        })
            .then(result => {
                // any logic
            })
            .catch((error) => {
                console.log('error => ', JSON.stringify(error));
            });
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }
}