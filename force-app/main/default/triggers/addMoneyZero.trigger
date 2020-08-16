trigger addMoneyZero on Wallet__c(before insert, before update) {
  if (Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)) {
    List<Entry__c> entry = new List<Entry__c>();
    for (Wallet__c i : Trigger.new) {
      i.Balance__c = i.Balance__c + i.Add_Amount__c;

      Entry__c ent = new Entry__c(
        Expense_Description__c = 'Balance Added',
        Amount__c = i.Add_Amount__c,
        User__c = i.User__c
      );
      i.Add_Amount__c = 0;
      i.Time_Stamp__c = System.now();
      entry.add(ent);
    }

    insert entry;
  }
}
