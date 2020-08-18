trigger WalACard on PayUser__c(after insert) {
  if (Trigger.isAfter && Trigger.isInsert) {
    List<Card__c> cards = new List<Card__c>();
    List<Wallet__c> wallet = new List<Wallet__c>();
    for (PayUser__c i : Trigger.new) {
      cards.add(new Card__c(Name = 'PayPal Card', User__c = i.Id));
      wallet.add(new Wallet__c(Email__c = i.Email__c, User__c = i.Id));
    }
    insert cards;
    insert wallet;
  }
}
