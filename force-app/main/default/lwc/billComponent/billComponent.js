import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import getBills from "@salesforce/apex/dataFetch.getBills";
import updateWallet from "@salesforce/apex/dataFetch.updateWallet";
import updateCard from "@salesforce/apex/dataFetch.updateCard";
import BillId from "@salesforce/schema/Bill__c.Id";
import PaymentMode from "@salesforce/schema/Bill__c.Mode_Of_payment__c";
import SuccPaid from "@salesforce/schema/Bill__c.Successfully_Paid__c";
import getCard from "@salesforce/apex/dataFetch.getCard";
import getWallet from "@salesforce/apex/dataFetch.getWallet";

const actions = [
  { label: "Record Details", name: "record_details" },
  { label: "Pay", name: "pay" }
];

const columns = [
  { label: "Bill Name", fieldName: "Name" },
  {
    label: "Amount",
    fieldName: "Amount__c",
    type: "currency",
    cellAttributes: { alignment: "left" },
    typeAttributes: { currencyCode: "INR" }
  },
  {
    label: "Due Date",
    fieldName: "Due_Date__c",
    type: "date",
    typeAttributes: {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  },
  {
    type: "action",
    typeAttributes: {
      rowActions: actions
    }
  }
];

let container = null;

export default class BillComponent extends LightningElement {
  @track bills = null;
  @track record = null;
  @track paytm = null;
  @track card = null;
  @track wallet = null;
  isEditForm = false;
  bShowModal = false;
  columns = columns;
  error = null;
  loader = null;

  @wire(getBills)
  bil({ data, error }) {
    if (data) {
      this.bills = data;
      this.error = null;
    } else if (error) {
      console.log(error);
      this.bills = null;
      this.error = JSON.stringify(error);
    } else {
      this.bills = null;
      this.error = "No Bills AvailAble Yet !";
    }
  }

  @wire(getCard)
  car({ data, error }) {
    if (data) {
      this.card = data;
      this.error = null;
    } else if (error) {
      this.error = JSON.stringify(error);
      this.card = null;
    } else {
      this.card = null;
      this.error = "Could not Fetch the Card !";
    }
  }

  @wire(getWallet)
  wall({ data, error }) {
    if (data) {
      this.wallet = data;
      this.error = null;
    } else if (error) {
      this.error = JSON.stringify(error);
      this.wallet = null;
    } else {
      this.error = "Could Not Fetch Wallet !";
      this.wallet = null;
    }
  }

  handleRowActions(event) {
    let actionName = event.detail.action.name;
    let row = event.detail.row;

    switch (actionName) {
      case "record_details":
        this.viewBill(row);
        break;
      case "pay":
        this.pay(row);
        break;
      default:
        console.log("Default Hit In !");
        break;
    }
  }

  viewBill(row) {
    console.log(row);
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = row;
  }

  closeModal() {
    this.bShowModal = false;
  }

  pay(row) {
    this.paytm = row;
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleSubmit(event) {
    console.log("Wallet :", JSON.stringify(this.wallet));
    console.log("Card: ", JSON.stringify(this.card));
    this.bShowModal = false;
    this.isEditForm = false;

    if (this.paytm.Successfully_Paid__c) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: "Bill has already been Paid !",
          variant: "success"
        })
      );
    } else {
      console.log(event.detail.fields.Mode_Of_payment__c);
      if (event.detail.fields.Mode_Of_payment__c === "") {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: "No Option Selected !",
            variant: "error"
          })
        );
      } else if (event.detail.fields.Mode_Of_payment__c === "Wallet") {
        if (this.wallet.Balance__c >= this.paytm.Amount__c) {
          const fields = {};
          fields[BillId.fieldApiName] = this.paytm.Id;
          fields[PaymentMode.fieldApiName] =
            event.detail.fields.Mode_Of_payment__c;
          fields[SuccPaid.fieldApiName] = true;
          const recordInp = { fields };
          container = JSON.parse(JSON.stringify(this.wallet));
          container.Balance__c = container.Balance__c - this.paytm.Amount__c;
          updateWallet({
            walle: container,
            num: this.paytm.Amount__c,
            str: this.paytm.Name
          })
            .then((data) => {
              if (data) {
                updateRecord(recordInp)
                  .then(() => {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Success",
                        message: "Bill Paid",
                        variant: "success"
                      })
                    );

                    window.location.reload();
                  })
                  .catch(() => {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Error",
                        message: "Bill could not be Paid !",
                        variant: "error"
                      })
                    );
                  });
              } else {
                console.log("Omg, not again !");
              }
            })
            .catch(() => {
              this.dispatchEvent(
                new ShowToastEvent({
                  title: "Error",
                  message: "An Error Occured !",
                  variant: "error"
                })
              );
            });
        } else {
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error",
              message: "Low Balance in Wallet, Top It Up !",
              variant: "error"
            })
          );
        }
      } else if (event.detail.fields.Mode_Of_payment__c === "Card") {
        if (this.card.Limit__c >= this.paytm.Amount__c) {
          const fields = {};
          fields[BillId.fieldApiName] = this.paytm.Id;
          fields[PaymentMode.fieldApiName] =
            event.detail.fields.Mode_Of_payment__c;
          fields[SuccPaid.fieldApiName] = true;
          const recordInp = { fields };
          container = JSON.parse(JSON.stringify(this.card));
          container.Limit__c = container.Limit__c - this.paytm.Amount__c;
          updateCard({
            car: container,
            num: this.paytm.Amount__c,
            str: this.paytm.Name
          })
            .then((data) => {
              if (data) {
                updateRecord(recordInp)
                  .then(() => {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Success",
                        message: "Bill Paid",
                        variant: "success"
                      })
                    );

                    window.location.reload();
                  })
                  .catch(() => {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Error",
                        message: "Bill could not be Paid !",
                        variant: "error"
                      })
                    );
                  });
              } else {
                console.log("Omg, not again !");
              }
            })
            .catch(() => {
              this.dispatchEvent(
                new ShowToastEvent({
                  title: "Error",
                  message: "An Error Occured !",
                  variant: "error"
                })
              );
            });
        } else {
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error",
              message: "An Error Occured !",
              variant: "error"
            })
          );
        }
      } else {
        console.log("Could Not Be Processed !");
      }
    }
  }
}
