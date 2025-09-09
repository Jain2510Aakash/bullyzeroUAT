import { LightningElement, track, wire, api } from 'lwc';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import PRODUCT_OBJECT from "@salesforce/schema/Product2";
import PRESENTATION_TYPE_FIELD from "@salesforce/schema/Product2.Presentation_Type__c";
import PROGRAM_TYPE_FIELD from "@salesforce/schema/Product2.Program_Type__c";
import WORKSHOP_OBJECT from "@salesforce/schema/Workshops__c";
import PRESENTATION_DURATION_FIELD from "@salesforce/schema/Workshops__c.Presentation_Duration_In_Minutes__c";
// Import Apex
import getProductsList from '@salesforce/apex/BookingFormProgramSelectionCtrl.getProductsList';
import convertLead from '@salesforce/apex/BookingFormProgramSelectionCtrl.convertLead';
import getSponsorshipTracker from '@salesforce/apex/BookingFormProgramSelectionCtrl.getSponsorshipTracker';

export default class BookingFormProgramSelection extends LightningElement {
    @api leadId;
    @api preferredDate1;
    @api filledByBullyZero;
    @api promoCode;
    productsList;
    @track selectedProgramsList = [];
    mainConFirstName;
    mainConLastName;
    noOfProgramsValue;
    showSuccessMessage = false;
    showSpinner = false;
    programTypeOptionsAll;
    presentationTypeOptions;
    productRecordTypeId;
    errorMessage;
    showErrorMessage = false;
    isFunded = false;
    sponsorshipTracker;
    showPaidProgramsQuestion = false;
    bookAddPresentations;
    showPaidPrograms = false;
    noOfPaidProgramsOptions;
    @track selectedPaidProgramsList = [];
    showNoOfProgramsErrorMessage = false;
    workshopRecordTypeId;
    presentationDurationOptions;
    reducedPresentationDurationOptions;

    get noOfProgramsOptions() {
        let options = [];
        let noOfOptions = 4;
        if (this.promoCode && this.sponsorshipTracker) {
            noOfOptions = this.sponsorshipTracker.Number_Of_Free_Programs_Per_School__c;
        }
        for (let i = 1; i <= noOfOptions; i++) {
            options.push({ label: i.toString(), value: i.toString() });
        }
        console.log('options => ', options);
        return options;
    }

    get noOfProgramsLabel() {
        if (this.promoCode) {
            return "How many free one-hour presentations would you like to book?";
        }
        else {
            return "How many one-hour presentations would you like to book?";
        }
    }

    get programTypeOptions() {
        console.log('this.programTypeOptionsAll => ', this.programTypeOptionsAll);
        if (this.promoCode && this.sponsorshipTracker && this.programTypeOptionsAll) {
            let availableProgramTypes = this.sponsorshipTracker.Program_Type__c.split(';');
            let programTypeOptionsAvailable = [];
            programTypeOptionsAvailable = this.programTypeOptionsAll.filter(item => availableProgramTypes.includes(item.value));
            console.log('programTypeOptionsAvailable => ', programTypeOptionsAvailable);
            return programTypeOptionsAvailable;
        }
        else
            return this.programTypeOptionsAll;
    }

    get instructionsHTML() {
        return '<p style="padding-bottom: 8px;"><b><u><span>Step 1.</span></u></b></p><p style="padding-bottom: 8px;"><b><span>Some important things to consider before moving through the booking process:</span></b></p><ul style="margin-top:0;margin-bottom:0;"> <li>Our programs are all age appropriate and designed in line with the year level stages, i.e., Year P-2, Year 3-4, Year 5-6, Year 7-8, Year 9-10, Year 11-12, through to adults.</li> <li>We can deliver up to 4 X 1-hour sessions in the one day, working the program around your daily timetable.</li> <li>There is a maximum of 100 students per session.</li> <li>Depending on the number of students you have in each cohort, will determine how many sessions you will need.</li> <li>If you have smaller cohorts, you can combine each session as per the year level stages outlined above. </li> <li>Wherever possible, it is preferred to have all sessions on the one day or additional travel costs may apply.</li> </ul><p style="padding-bottom: 8px; padding-top: 8px;"><span><b><u>Step 2.</u></b></span></p><p style="padding-bottom: 8px;"><span><b>Information needed before proceeding with a booking:</b></span></p><ul style="margin-top:0;margin-bottom:0;"> <li>Decide how many sessions are needed</li> <li>Year levels participating in each session</li> <li>Number of students in each session</li> <li>Program selection for each session</li> <li>Starting times for each session</li> <li>A few different dates you have in mind so we can check for availability</li> </ul><p style="padding-bottom: 8px; padding-top: 8px;"><b><u>Step 3.</u></b></p><p style="padding-bottom: 8px;"><span>To proceed with booking process - complete "Program Booking Form" to generate a quote.</span></p>';
    }

    get bookAddPresentationsOptions() {
        return [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];
    }

    // get todayDate() {
    //     let d = new Date();
    //     let sydneyTime = d.toLocaleDateString("en-US", { timeZone: "Australia/Sydney" });
    //     return sydneyTime;
    // }

    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    results({ error, data }) {
        if (data) {
            this.productRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.log('error => ', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: "$productRecordTypeId", fieldApiName: PROGRAM_TYPE_FIELD })
    familyPicklistResults({ error, data }) {
        if (data) {
            this.programTypeOptionsAll = data.values;
        } else if (error) {
            console.log('error => ', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: "$productRecordTypeId", fieldApiName: PRESENTATION_TYPE_FIELD })
    typePicklistResults({ error, data }) {
        if (data) {
            this.presentationTypeOptions = data.values;
        } else if (error) {
            console.log('error => ', error);
        }
    }

    @wire(getObjectInfo, { objectApiName: WORKSHOP_OBJECT })
    results2({ error, data }) {
        if (data) {
            this.workshopRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.log('error => ', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: "$workshopRecordTypeId", fieldApiName: PRESENTATION_DURATION_FIELD })
    durationPicklistResults({ error, data }) {
        if (data) {
            this.presentationDurationOptions = data.values;
            this.reducedPresentationDurationOptions = [...data.values];
            var index = -1;

            for (let i = 0; i < this.reducedPresentationDurationOptions.length; i++) {
                if (this.reducedPresentationDurationOptions[i].value == '80') {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                this.reducedPresentationDurationOptions.splice(index, 3);
            }
            console.log('PresentDuration' + JSON.stringify(this.presentationDurationOptions));
            console.log('extendedPresentDuration' + JSON.stringify(this.reducedPresentationDurationOptions));
        } else if (error) {
            console.log('error => ', error);
        }
    }

    @wire(getProductsList, {})
    wiredProducts({ data, error }) {
        if (data) {
            this.productsList = data;
        } else if (error) {
            console.log('error in getProductsList => ', error);
        }
    }

    @wire(getSponsorshipTracker, { promoCode: "$promoCode" })
    wiredSponsorshipData({ data, error }) {
        if (data) {
            this.sponsorshipTracker = data;
            console.log('sponsorshipTracker => ', this.sponsorshipTracker);
        } else if (error) {
            console.log('error in getSponsorshipTracker => ', error);
        }
    }

    connectedCallback() {
        if (this.promoCode) {
            this.isFunded = true;
        }
    }

    handleChange(event) {
        let name = event.target.name;
        let value = event.target.value;
        let index = parseInt(event.target.dataset.index);
        if (name == 'Program Type') {
            this.selectedProgramsList[index].programTypeValue = value;
            this.setProgramSelectionOptions(index);
            this.selectedProgramsList[index].presentationDurationValue = null;

            if (value =='Workplace Programs' || value =='Customised Programs'|| value =='Parent & Teacher Programs') {
                this.selectedProgramsList[index].presentDuration = this.presentationDurationOptions;
            }
            else if (this.selectedProgramsList[index].presentDuration != this.reducedPresentationDurationOptions) {
                this.selectedProgramsList[index].presentDuration = this.reducedPresentationDurationOptions;
            }
            console.log('presentationDuration' + JSON.stringify(this.selectedProgramsList[index].presentDuration));
        }
        else if (name == 'Presentation Type') {
            this.selectedProgramsList[index].presentationTypeValue = value;
            this.setProgramSelectionOptions(index);
        }
        else if (name == 'Program Selection') {
            this.selectedProgramsList[index].yearLevelsList = [];
            let yearLevelList = this.productsList.find(element => element.Id == value).Year_Level__c.split(';');
            yearLevelList.forEach(item => {
                this.selectedProgramsList[index].yearLevelsList.push({ label: item, value: item });
            });
            this.selectedProgramsList[index].programSelectionValue = value;
            this.selectedProgramsList[index].yearLevelValue = null;
            this.selectedProgramsList[index].isYearLevelDisabled = false;
        }
        else if (name == 'Year Level Group') {
            this.selectedProgramsList[index].yearLevelValue = value;
        }
        else if (name == 'Number Of Participants') {
            this.selectedProgramsList[index].noOfParticpantsValue = value;
        }
        else if (name == 'Schedule Time For Program') {
            this.selectedProgramsList[index].scheduleTimeForProgram = value;
        }
        else if (name == 'Presentation Duration') {
            this.selectedProgramsList[index].presentationDurationValue = value;
            console.log('PresentDurationValue ' + this.selectedProgramsList[index].presentationDurationValue);
        }
        // else if (name == 'Schedule DateTime For Program') {
        //     this.selectedProgramsList[index].scheduleForProgram = value;
        // }
        // console.log('this.selectedProgramsList => ', this.selectedProgramsList);
    }

    setProgramSelectionOptions(index) {
        if (this.selectedProgramsList[index].programTypeValue && this.selectedProgramsList[index].presentationTypeValue) {
            if (this.productsList.length > 0) {
                this.selectedProgramsList[index].programSelectionOptions = [];
                this.productsList.forEach(item => {
                    if (item.Program_Type__c == this.selectedProgramsList[index].programTypeValue && item.Presentation_Type__c == this.selectedProgramsList[index].presentationTypeValue) {
                        let optionLabel = item.Name;
                        if (item.PricebookEntries) {
                            optionLabel = optionLabel + ' - $' + item.PricebookEntries[0].UnitPrice;
                        }
                        this.selectedProgramsList[index].programSelectionOptions.push({ label: optionLabel, value: item.Id });
                    }
                });

                if (this.selectedProgramsList[index].programSelectionOptions.length > 0) {
                    this.selectedProgramsList[index].isProgramSelectionDisabled = false;
                }
                else {
                    this.selectedProgramsList[index].isProgramSelectionDisabled = true;
                }
                this.selectedProgramsList[index].programSelectionValue = null;
                this.selectedProgramsList[index].yearLevelValue = null;
                this.selectedProgramsList[index].isYearLevelDisabled = true;
            }
        }
    }

    handleChange2(event) {
        let name = event.target.name;
        let value = event.target.value;
        if (name == 'Main Contact First Name') {
            this.mainConFirstName = value;
        }
        else if (name == 'Main Contact Last Name') {
            this.mainConLastName = value;
        }
        else if (name == 'Number Of Programs') {
            this.showNoOfProgramsErrorMessage = false;
            let noOfProgramsOldValue = this.noOfProgramsValue;
            let noOfPrograms = parseInt(value);
            if (!this.bookAddPresentations || this.bookAddPresentations == 'No' || (this.bookAddPresentations == 'Yes' && !this.noOfPaidProgramsValue)) {
                this.noOfProgramsValue = value;
                if (noOfPrograms > this.selectedProgramsList.length) {
                    for (let i = this.selectedProgramsList.length; i < noOfPrograms; i++) {
                        this.isFunded ? this.selectedProgramsList.push({ key: i + 1, isProgramSelectionDisabled: true, isYearLevelDisabled: true, organisation: this.sponsorshipTracker.Organisation__c, presentDuration: this.reducedPresentationDurationOptions }) : this.selectedProgramsList.push({ key: i + 1, isProgramSelectionDisabled: true, isYearLevelDisabled: true, presentDuration: this.reducedPresentationDurationOptions });
                    }
                }
                else if (noOfPrograms < this.selectedProgramsList.length) {
                    this.selectedProgramsList.splice(noOfPrograms, this.selectedProgramsList.length - noOfPrograms);
                }
                this.showPaidProgramsQuestion = noOfPrograms < 4 ? true : false;
                if (this.bookAddPresentations == 'Yes' && noOfPrograms < 4) {
                    this.noOfPaidProgramsOptions = [];
                    let noOfOptions = 4 - noOfPrograms;
                    for (let i = 1; i <= noOfOptions; i++) {
                        this.noOfPaidProgramsOptions.push({ label: i.toString(), value: i.toString() });
                    }
                }
            }
            else if (this.bookAddPresentations == 'Yes' && this.noOfPaidProgramsValue) {
                if (noOfPrograms > this.selectedProgramsList.length) {
                    if (noOfPrograms + parseInt(this.noOfPaidProgramsValue) <= 4) {
                        this.noOfProgramsValue = value;
                        for (let i = this.selectedProgramsList.length; i < noOfPrograms; i++) {
                            this.selectedProgramsList.push({ key: i + 1, isProgramSelectionDisabled: true, isYearLevelDisabled: true, organisation: this.sponsorshipTracker.Organisation__c, presentDuration: this.reducedPresentationDurationOptions });
                        }
                        this.noOfPaidProgramsOptions = [];
                        let noOfOptions = 4 - noOfPrograms;
                        for (let i = 1; i <= noOfOptions; i++) {
                            this.noOfPaidProgramsOptions.push({ label: i.toString(), value: i.toString() });
                        }
                        this.selectedPaidProgramsList.forEach((item, index) => {
                            item.key = index + noOfPrograms + 1;
                        });
                    }
                    else {
                        this.noOfProgramsValue = null;
                        Promise.resolve().then(() => {
                            this.noOfProgramsValue = noOfProgramsOldValue; // Revert to old value
                        });
                        this.showNoOfProgramsErrorMessage = true;
                    }
                }
                else if (noOfPrograms < this.selectedProgramsList.length) {
                    this.noOfProgramsValue = value;
                    this.selectedProgramsList.splice(noOfPrograms, this.selectedProgramsList.length - noOfPrograms);
                    this.noOfPaidProgramsOptions = [];
                    let noOfOptions = 4 - noOfPrograms;
                    for (let i = 1; i <= noOfOptions; i++) {
                        this.noOfPaidProgramsOptions.push({ label: i.toString(), value: i.toString() });
                    }
                    this.selectedPaidProgramsList.forEach((item, index) => {
                        item.key = index + noOfPrograms + 1;
                    });
                }
            }
        }
        else if (name == 'Book Additional Presentations') {
            this.bookAddPresentations = value;
            if (this.bookAddPresentations == 'Yes') {
                this.noOfPaidProgramsOptions = [];
                let noOfOptions = 4 - parseInt(this.noOfProgramsValue);
                for (let i = 1; i <= noOfOptions; i++) {
                    this.noOfPaidProgramsOptions.push({ label: i.toString(), value: i.toString() });
                }
                this.showPaidPrograms = true;
            }
            else {
                this.showPaidPrograms = false;
                this.selectedPaidProgramsList = [];
                this.noOfPaidProgramsValue = null;
            }
        }
        else if (name == 'Number Of Paid Programs') {
            this.noOfPaidProgramsValue = value;
            let noOfPrograms = parseInt(value);
            if (noOfPrograms > this.selectedPaidProgramsList.length) {
                for (let i = this.selectedPaidProgramsList.length; i < noOfPrograms; i++) {
                    this.selectedPaidProgramsList.push({ key: i + 1 + parseInt(this.noOfProgramsValue), isProgramSelectionDisabled: true, isYearLevelDisabled: true, presentDuration: this.reducedPresentationDurationOptions });
                }
            }
            else if (noOfPrograms < this.selectedPaidProgramsList.length) {
                this.selectedPaidProgramsList.splice(noOfPrograms, this.selectedPaidProgramsList.length - noOfPrograms);
            }
        }
    }

    handleChange3(event) {
        let name = event.target.name;
        let value = event.target.value;
        let index = parseInt(event.target.dataset.index);
        if (name == 'Program Type') {
            this.selectedPaidProgramsList[index].programTypeValue = value;
            this.setPaidProgramSelectionOptions(index);
            this.selectedPaidProgramsList[index].presentationDurationValue = null;

            if (value =='Workplace Programs' || value =='Customised Programs' || value =='Parent & Teacher Programs') {
                this.selectedPaidProgramsList[index].presentDuration = this.presentationDurationOptions;
            }
            else if (this.selectedPaidProgramsList[index].presentDuration != this.reducedPresentationDurationOptions) {
                this.selectedPaidProgramsList[index].presentDuration = this.reducedPresentationDurationOptions;
            }
            console.log('presentationDuration' + JSON.stringify(this.selectedPaidProgramsList[index].presentDuration));
        }
        else if (name == 'Presentation Type') {
            this.selectedPaidProgramsList[index].presentationTypeValue = value;
            this.setPaidProgramSelectionOptions(index);
        }
        else if (name == 'Program Selection') {
            this.selectedPaidProgramsList[index].yearLevelsList = [];
            let yearLevelList = this.productsList.find(element => element.Id == value).Year_Level__c.split(';');
            yearLevelList.forEach(item => {
                this.selectedPaidProgramsList[index].yearLevelsList.push({ label: item, value: item });
            });
            this.selectedPaidProgramsList[index].programSelectionValue = value;
            this.selectedPaidProgramsList[index].yearLevelValue = null;
            this.selectedPaidProgramsList[index].isYearLevelDisabled = false;
        }
        else if (name == 'Year Level Group') {
            this.selectedPaidProgramsList[index].yearLevelValue = value;
        }
        else if (name == 'Number Of Participants') {
            this.selectedPaidProgramsList[index].noOfParticpantsValue = value;
        }
        else if (name == 'Schedule Time For Program') {
            this.selectedPaidProgramsList[index].scheduleTimeForProgram = value;
        }
        else if (name == 'Presentation Duration') {
            this.selectedPaidProgramsList[index].presentationDurationValue = value;
        }
    }

    setPaidProgramSelectionOptions(index) {
        if (this.selectedPaidProgramsList[index].programTypeValue && this.selectedPaidProgramsList[index].presentationTypeValue) {
            if (this.productsList.length > 0) {
                this.selectedPaidProgramsList[index].programSelectionOptions = [];
                this.productsList.forEach(item => {
                    if (item.Program_Type__c == this.selectedPaidProgramsList[index].programTypeValue && item.Presentation_Type__c == this.selectedPaidProgramsList[index].presentationTypeValue) {
                        let optionLabel = item.Name;
                        if (item.PricebookEntries) {
                            optionLabel = optionLabel + ' - $' + item.PricebookEntries[0].UnitPrice;
                        }
                        this.selectedPaidProgramsList[index].programSelectionOptions.push({ label: optionLabel, value: item.Id });
                    }
                });

                if (this.selectedPaidProgramsList[index].programSelectionOptions.length > 0) {
                    this.selectedPaidProgramsList[index].isProgramSelectionDisabled = false;
                }
                else {
                    this.selectedPaidProgramsList[index].isProgramSelectionDisabled = true;
                }
                this.selectedPaidProgramsList[index].programSelectionValue = null;
                this.selectedPaidProgramsList[index].yearLevelValue = null;
                this.selectedPaidProgramsList[index].isYearLevelDisabled = true;
            }
        }
    }

    validateFormPartB(event) {
        // console.log('leadId => ', this.leadId);
        // console.log('preferredDate1 => ', this.preferredDate1);
        this.showErrorMessage = false;
        this.errorMessage = '';
        let isValid = true;
        let isTimeValid = true;
        let isNoOfParticipantsValid = true;
        let isProgramSelectionValid = true;
        let fields = this.template.querySelectorAll('.validate');
        fields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        });
        if (isValid) {
            let selectedProgramsCombinedList = [];
            selectedProgramsCombinedList = this.selectedProgramsList.concat(this.selectedPaidProgramsList);
            console.log('selectedProgramsCombinedList => ', selectedProgramsCombinedList);
            selectedProgramsCombinedList.forEach((item, index) => {
                if (!item.programSelectionValue) {
                    isProgramSelectionValid = false;
                }
                if (item.programTypeValue != 'Parent & Teacher Programs' && parseInt(item.noOfParticpantsValue) > 100) {
                    isNoOfParticipantsValid = false;
                }
                selectedProgramsCombinedList.forEach((innerItem, innerIndex) => {
                    if (index != innerIndex) {
                        let timeDiffInMinutes = this.calculateTimeDifference(item.scheduleTimeForProgram, innerItem.scheduleTimeForProgram);
                        if (timeDiffInMinutes > -60 && timeDiffInMinutes < 60) {
                            isTimeValid = false;
                        }
                    }
                });
            });
            if (isNoOfParticipantsValid && isTimeValid && isProgramSelectionValid) {
                this.showSpinner = true;
                let workshopList = [];
                selectedProgramsCombinedList.forEach(item => {
                    let workshopObj = {};
                    workshopObj.Program = item.programSelectionValue;
                    workshopObj.Program_Type = item.programTypeValue;
                    workshopObj.Presentation_Type = item.presentationTypeValue;
                    workshopObj.Number_of_Attendees = parseInt(item.noOfParticpantsValue);
                    if (this.preferredDate1) {
                        // console.log('date before passing to apex => ', this.preferredDate1 + 'T' + item.scheduleTimeForProgram); //  + 'Z'
                        workshopObj.Start_Date_Time = this.preferredDate1 + 'T' + item.scheduleTimeForProgram; //  + 'Z'
                    }
                    workshopObj.Year_Level = item.yearLevelValue;
                    workshopObj.Funded_by_3rd_Party = item.organisation;
                    workshopObj.Presentation_Duration_In_Minutes = item.presentationDurationValue;
                    workshopList.push(workshopObj);
                });
                this.convertLead(workshopList);
            }
            else if (!isProgramSelectionValid) {
                // const evt = new ShowToastEvent({
                //     title: 'Error',
                //     message: 'Please choose a different combination of "Program Type" and "Presentation Type" for a valid "Program Selection".',
                //     variant: 'error'
                // });
                // this.dispatchEvent(evt);
                this.errorMessage = 'Please choose a different combination of "Program Type" and "Presentation Type" for a valid "Program Selection".';
                this.showErrorMessage = true;
            }
            else if (!isNoOfParticipantsValid) {
                // const evt = new ShowToastEvent({
                //     title: 'Error',
                //     message: 'A session cannot have more than 100 participants. This is exclusive to the "Parent & Teacher Programs".',
                //     variant: 'error'
                // });
                // this.dispatchEvent(evt);
                this.errorMessage = 'A session cannot have more than 100 participants. This is exclusive to the "Parent & Teacher Programs".';
                this.showErrorMessage = true;
            }
            else if (!isTimeValid) {
                // const evt = new ShowToastEvent({
                //     title: 'Error',
                //     message: 'There should be at least a one-hour gap between the start times of the two programs.',
                //     variant: 'error'
                // });
                // this.dispatchEvent(evt);
                this.errorMessage = 'There should be at least a one-hour gap between the start times of the two programs.';
                this.showErrorMessage = true;
            }
        }
        else if (!isValid) {
            // const evt = new ShowToastEvent({
            //     title: 'Error',
            //     message: 'Please check for all error messages in the form.',
            //     variant: 'error'
            // });
            // this.dispatchEvent(evt);
            this.errorMessage = 'Please check for all error messages in the form.';
            this.showErrorMessage = true;
        }
    }

    calculateTimeDifference(startTime, endTime) {
        // Parse the time values (HH:MM format) into hours and minutes
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        // console.log('Start & End Timnes => ', startHours, ' ', startMinutes, ' ', endHours, ' ', endMinutes);
        // Convert start and end times into total minutes
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        // Calculate the difference in minutes
        const diffInMiniutes = endTotalMinutes - startTotalMinutes;
        // console.log('diffInMiniutes => ', diffInMiniutes);
        return diffInMiniutes;
    }

    convertLead(workshopList) {
        convertLead({ leadId: this.leadId, workshopString: JSON.stringify(workshopList), whoWillBeMainContact: this.mainConFirstName + ' ' + this.mainConLastName, filledByBullyZero: this.filledByBullyZero, promoCode: this.promoCode })
            .then(result => {
                if (result === 'SUCCESS') {
                    this.showSuccessMessage = true;
                }
                else {
                    console.log('Error while converting => ', result);
                }
                this.showSpinner = false;
            })
            .catch(error => {
                console.log('Error while converting => ', error);
                this.showSpinner = false;
            });
    }
}