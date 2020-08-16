import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import getUser from "@salesforce/apex/dataFetch.getUser";
import makeUser from "@salesforce/apex/dataFetch.makeUser";
import getCard from "@salesforce/apex/dataFetch.getCard";
import getWallet from "@salesforce/apex/dataFetch.getWallet";
import User_Id from "@salesforce/schema/PayUser__c.Id";
import User_Name from "@salesforce/schema/PayUser__c.Name";
import User_Number from "@salesforce/schema/PayUser__c.Contact_Number__c";
import WalletId from "@salesforce/schema/Wallet__c.Id";
import WalletAddAmount from "@salesforce/schema/Wallet__c.Add_Amount__c";

export default class UserComponent extends LightningElement {
  @track profile = null;
  @track card = null;
  @track wallet = null;
  @track addProfile = false;
  isEditForm = false;
  bShowModal = false;
  lessThan = false;
  loader = true;
  edit = false;
  error = null;
  disabled = false;

  @wire(getUser)
  user({ data, error }) {
    if (data) {
      this.loader = false;
      this.addProfle = false;
      this.profile = data;
      this.error = null;
    } else if (error) {
      this.loader = false;
      this.addProfile = false;
      this.profile = null;
      this.error = JSON.stringify(error);
    } else if (data === null) {
      this.addProfile = true;
      this.profile = null;
      this.error = null;
      this.loader = false;
    }
  }

  cardButton() {
    this.loader = true;
    getCard()
      .then((data) => {
        if (data) {
          this.loader = false;
          this.card = data;
        }
      })
      .catch((err) => {
        this.loader = false;
        this.error = JSON.stringify(err);
      });
  }

  walletButton() {
    this.loader = true;
    getWallet()
      .then((data) => {
        if (data) {
          this.loader = false;
          this.wallet = data;
          if (this.wallet.Balance__c < 500) {
            this.lessThan = true;
          }
        }
      })
      .catch((err) => {
        this.loader = false;
        this.error = JSON.stringify(err);
      });
  }

  handleClick(event) {
    this.loader = true;

    makeUser()
      .then((data) => {
        this.loader = false;
        this.profile = data;
        this.error = null;
        this.addProfile = false;
        window.location.reload();
      })
      .catch((err) => {
        this.loader = false;
        this.addProfile = false;
        this.profile = null;
        this.error = JSON.stringify(err);
      });

    console.log(event);
  }

  editProfile() {
    this.edit = !this.edit;
  }

  handleChange(event) {
    if (!event.target.value) {
      event.target.reportValidity();
      this.disabled = true;
    } else {
      this.disabled = false;
    }
  }

  updateUser() {
    const allValid = [
      ...this.template.querySelectorAll("lightning-input")
    ].reduce((validSoFar, inputFields) => {
      inputFields.reportValidity();
      return validSoFar && inputFields.checkValidity();
    }, true);

    if (allValid) {
      const fields = {};
      fields[User_Id.fieldApiName] = this.profile.Id;
      fields[User_Name.fieldApiName] = this.template.querySelector(
        "[data-field='Name']"
      ).value;
      fields[User_Number.fieldApiName] = this.template.querySelector(
        "[data-field='Contact_Number']"
      ).value;

      const recordInput = { fields };

      updateRecord(recordInput)
        .then(() => {
          this.editProfile();
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success",
              message: "Profile updated",
              variant: "success"
            })
          );
        })
        .catch((error) => {
          this.editProfile();
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error updating record",
              message: error.body.message,
              variant: "error"
            })
          );
        });
      window.location.reload();
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Something is wrong",
          message: "Check your input and try again.",
          variant: "error"
        })
      );
    }
  }

  closeModal() {
    this.bShowModal = false;
  }

  addMoney() {
    this.bShowModal = true;
    this.isEditForm = true;
  }

  handleSubmit(event) {
    this.bShowModal = false;
    this.isEditForm = false;

    const fields = {};
    fields[WalletId.fieldApiName] = this.wallet.Id;
    fields[WalletAddAmount.fieldApiName] = event.detail.fields.Add_Amount__c;

    const recordInp = { fields };

    updateRecord(recordInp)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Amount Added to Wallet",
            variant: "success"
          })
        );

        window.location.reload();
      })
      .catch(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: "Amount COuld not be added !",
            variant: "error"
          })
        );
      });
  }
}
