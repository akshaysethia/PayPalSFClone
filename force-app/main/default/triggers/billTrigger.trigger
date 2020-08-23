trigger billTrigger on Bill__c(before insert, before update) {
  if (Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)) {
    for (Bill__c i : Trigger.new) {
      if (i.Amount__c > 5000) {
        if (i.Amount__c < 10000) {
          i.Offer__c = 20;
          i.Amount__c = i.Amount__c - ((i.Amount__c * i.Offer__c) / 100);
        } else {
          if (i.Amount__c < 15000) {
            i.Offer__c = 50;
            i.Amount__c = i.Amount__c - ((i.Amount__c * i.Offer__c) / 100);
          } else {
            i.Offer__c = 80;
            i.Amount__c = i.Amount__c - ((i.Amount__c * i.Offer__c) / 100);
          }
        }
      } else {
        i.Offer__c = 0;
      }
    }
  }
}