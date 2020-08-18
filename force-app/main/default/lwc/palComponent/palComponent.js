import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAllUsers from "@salesforce/apex/dataFetch.getAllUsers";
import setPal from "@salesforce/apex/dataFetch.setPal";
import getUserPals from "@salesforce/apex/dataFetch.getUserPals";
import getCard from "@salesforce/apex/dataFetch.getCard";
import getWallet from "@salesforce/apex/dataFetch.getWallet";
import updateWallet from "@salesforce/apex/dataFetch.updateWallet";
import updateCard from "@salesforce/apex/dataFetch.updateCard";
import addMoney from "@salesforce/apex/dataFetch.addMoney";

const columns = [
  { label: "Name", fieldName: "Name" },
  { label: "Email", fieldName: "Email__c" },
  { label: "Contact", fieldName: "Contact_Number__c" },
  {
    label: "Add Pal",
    type: "button",
    typeAttributes: {
      label: "Add",
      name: "Add",
      title: "Add",
      disabled: false,
      value: "add"
    }
  }
];

const cols = [
  { label: "Pals", fieldName: "Name" },
  { label: "Type", fieldName: "Type__c" },
  {
    label: "Send Money",
    type: "button",
    typeAttributes: {
      label: "Send",
      name: "Send",
      title: "Send",
      disabled: false,
      value: "send"
    }
  }
];

let xyz;

export default class PalComponent extends LightningElement {
  @track allUsers;
  @track pals;
  @track card;
  @track wallet;
  showModal = false;
  editModal = false;
  record;
  name;
  columns = columns;
  cols = cols;
  error;
  loader = true;
  backup;

  @wire(getAllUsers)
  funct({ data, error }) {
    if (data) {
      this.loader = false;
      this.allUsers = data;
      this.error = null;
    } else if (error) {
      this.loader = false;
      this.allUsers = null;
      this.error = JSON.stringify(error);
    } else {
      this.loader = false;
      this.allUsers = null;
      this.error = "Users Could Not Be Fetched !";
    }
  }

  @wire(getUserPals)
  apl({ data, error }) {
    if (data) {
      let values = [];
      data.forEach((element) => {
        let value = {};
        value.Id = element.Id;
        value.Name = element.slave_user__r.Name;
        value.DepId = element.slave_user__c;
        value.Type__c = element.Type__c;

        values.push(value);
      });

      this.loader = false;
      this.pals = values;
      this.backup = values;
      this.error = null;
    } else if (error) {
      this.loader = false;
      this.pals = null;
      this.error = JSON.stringify(error);
    } else {
      this.loader = false;
      this.pals = null;
      this.error = "No Pals";
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

  callRowAction(event) {
    const recId = event.detail.row.Id;
    const actionName = event.detail.action.name;
    if (actionName === "Add") {
      console.log(recId);
      setPal({ id: recId })
        .then((data) => {
          if (data) {
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Success",
                message: "Pal has Been Added !",
                variant: "success"
              })
            );
          }
        })
        .catch((error) => {
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error",
              message: JSON.stringify(error),
              variant: "error"
            })
          );
        });
    } else {
      console.log("Invalid Option");
    }
  }

  handleRow(event) {
    this.record = event.detail.row.DepId;
    this.name = event.detail.row.Name;
    console.log(this.record, this.name);
    const actionName = event.detail.action.name;

    console.log(actionName);

    if (actionName === "Send") {
      console.log(actionName);
      this.showModal = true;
    } else if (actionName === "Edit") {
      this.showModal = true;
    } else {
      console.log("Nothing !");
    }
  }

  closeModal() {
    this.showModal = false;
  }

  payPal(event) {
    this.showModal = false;

    if (event.detail.fields.Mode_Of_payment__c === "") {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "No Option Selected !",
          variant: "error"
        })
      );
    } else if (event.detail.fields.Mode_Of_payment__c === "Wallet") {
      if (this.wallet.Balance__c >= event.detail.fields.Amount__c) {
        xyz = JSON.parse(JSON.stringify(this.wallet));
        xyz.Balance__c = xyz.Balance__c - event.detail.fields.Amount__c;

        console.log("Name: ", this.name);

        updateWallet({
          walle: xyz,
          num: event.detail.fields.Amount__c,
          str: this.name
        })
          .then((data) => {
            if (data) {
              addMoney({
                id: this.record,
                num: event.detail.fields.Amount__c
              })
                .then((dat) => {
                  if (dat) {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Success",
                        message: "Paid to pal !",
                        variant: "success"
                      })
                    );
                  } else {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Error",
                        message: "Could Not Send To pal !",
                        variant: "error"
                      })
                    );
                  }
                })
                .catch((error) => {
                  this.dispatchEvent(
                    new ShowToastEvent({
                      title: "Error",
                      message: JSON.stringify(error),
                      variant: "error"
                    })
                  );
                });
            } else {
              this.dispatchEvent(
                new ShowToastEvent({
                  title: "Error",
                  message: "Could Not Send To pal !",
                  variant: "error"
                })
              );
            }
          })
          .catch((error) => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Error",
                message: JSON.stringify(error),
                variant: "error"
              })
            );
          });
      } else {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: "Low Wallet Balance",
            variant: "error"
          })
        );
      }
    } else if (event.detail.fields.Mode_Of_payment__c === "Card") {
      if (this.card.Limit__c >= event.detail.fields.Amount__c) {
        xyz = JSON.parse(JSON.stringify(this.card));
        xyz.Limit__c = xyz.Limit__c - event.detail.fields.Amount__c;

        updateCard({
          car: xyz,
          num: event.detail.fields.Amount__c,
          str: this.record.Name
        })
          .then((data) => {
            if (data) {
              addMoney({
                id: this.record,
                num: event.detail.fields.Amount__c
              })
                .then((dat) => {
                  if (dat) {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Success",
                        message: "Paid to pal !",
                        variant: "success"
                      })
                    );
                  } else {
                    this.dispatchEvent(
                      new ShowToastEvent({
                        title: "Error",
                        message: "Could Not Send To pal !",
                        variant: "error"
                      })
                    );
                  }
                })
                .catch((error) => {
                  this.dispatchEvent(
                    new ShowToastEvent({
                      title: "Error",
                      message: JSON.stringify(error),
                      variant: "error"
                    })
                  );
                });
            } else {
              this.dispatchEvent(
                new ShowToastEvent({
                  title: "Error",
                  message: "Pal Not Paid !",
                  variant: "error"
                })
              );
            }
          })
          .catch((error) => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Error",
                message: JSON.stringify(error),
                variant: "error"
              })
            );
          });
      } else {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: "Out Of Limits !",
            variant: "error"
          })
        );
      }
    }
  }

  handleNameChange(event) {
    if (event.target.value === "") {
      this.pals = this.backup;
    } else {
      this.pals = this.backup.filter((item) =>
        item.Name.toLowerCase().includes(event.target.value.toLowerCase())
      );
    }
  }
}
