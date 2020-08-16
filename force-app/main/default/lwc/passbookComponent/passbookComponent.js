import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getEntries from "@salesforce/apex/dataFetch.getEntries";
import EntryId from "@salesforce/schema/Entry__c.Id";
import EntryFlag from "@salesforce/schema/Entry__c.Flag_This__c";
import { updateRecord } from "lightning/uiRecordApi";

const columns = [
  { label: "Expence Name", fieldName: "Name" },
  { label: "Expense Desc.", fieldName: "Expense_Description__c", type: "text" },
  {
    label: "Time oF Transaction",
    fieldName: "Date_Time__c",
    type: "date",
    typeAttributes: {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  },
  { label: "Comment", fieldName: "Comment__c", type: "text" },
  {
    label: "Amount",
    fieldName: "Amount__c",
    type: "currency",
    cellAttributes: { alignment: "left" },
    typeAttributes: { currencyCode: "INR" }
  },
  {
    label: "Flagged ?",
    fieldName: "Flag_This__c",
    type: "boolean",
    editable: true
  }
];

export default class PassbookComponent extends LightningElement {
  @track entries = null;
  @track draftValues = [];
  error = null;
  loader = true;
  columns = columns;

  @wire(getEntries)
  entry({ data, error }) {
    if (data) {
      console.log("Data Found: ", data);
      this.loader = false;
      this.entries = data;
      this.error = null;
    } else if (error) {
      console.log("Error: ", error);
      this.loader = false;
      this.error = JSON.stringify(error);
      this.entries = null;
    } else if (!data) {
      this.loader = false;
      this.error = "No Entries Present At the Moment !";
      this.entries = null;
    }
    console.log("Data At The End: ", data);
  }

  handlePDF() {
    print(this.entries);
  }

  handleSave(event) {
    const fields = {};
    fields[EntryId.fieldApiName] = event.detail.draftValues[0].Id;
    fields[EntryFlag.fieldApiName] = event.detail.draftValues[0].Flag_This__c;

    const recordInp = { fields };

    updateRecord(recordInp)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Contact updated",
            variant: "success"
          })
        );
        // Clear all draft values
        this.draftValues = [];

        window.location.reload();
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error creating record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }
}
