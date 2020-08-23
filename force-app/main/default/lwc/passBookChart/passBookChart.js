import { LightningElement, track ,wire } from "lwc";
import gettingEntries from "@salesforce/apex/fetchEntryData.gettingEntries";

export default class PassBookChart extends LightningElement {
  @track chartConfiguration;

  @wire(gettingEntries, {})
  getEntries({ error, data }) {
    if (error) {
      this.error = error;
      console.log("error => " + JSON.stringify(error));
      this.chartConfiguration = undefined;
    } else if (data) {
      let chartData = [];
      let chartLabels = [];
      data.forEach((opp) => {
        chartData.push(opp.Amount__c);
        chartLabels.push(opp.Expense_Description__c);
      });

      this.chartConfiguration = {
        type: "bar",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Entry",
              barPercentage: 0.5,
              barThickness: 6,
              maxBarThickness: 8,
              minBarLength: 2,
              backgroundColor: "green",
              data: chartData
            }
          ]
        },
        options: {}
      };
      console.log("data => ", data);
      this.error = undefined;
    }
  }
}
