public with sharing class dataFetch {
  @AuraEnabled(cacheable=true)
  public static PayUser__c getUser() {
    PayUser__c[] user = [
      SELECT Id, Name, Email__c, Contact_Number__c
      FROM PayUser__c
      WHERE Email__c = :UserInfo.getUserEmail()
      LIMIT 1
    ];
    if (user.size() > 0) {
      return user[0];
    } else {
      return null;
    }
  }

  @AuraEnabled
  public static PayUser__c makeUser() {
    PayUser__c user = new PayUser__c(
      Name = UserInfo.getName(),
      Email__c = UserInfo.getUserEmail()
    );
    insert user;
    return user;
  }

  @AuraEnabled(cacheable=true)
  public static Card__c getCard() {
    Card__c[] card = [
      SELECT Id, Name, Card_Number__c, CVV__c, Expiry_Date__c, Limit__c
      FROM Card__c
      WHERE User__r.Email__c = :UserInfo.getUserEmail()
    ];
    if (card.size() > 0) {
      return card[0];
    } else {
      return null;
    }
  }

  @AuraEnabled(cacheable=true)
  public static Wallet__c getWallet() {
    Wallet__c[] wallet = [
      SELECT Id, Name, Balance__c, Time_Stamp__c
      FROM Wallet__c
      WHERE User__r.Email__c = :UserInfo.getUserEmail()
    ];
    if (wallet.size() > 0) {
      return wallet[0];
    } else {
      return null;
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Bill__c> getBills() {
    List<Bill__c> bills = new List<Bill__c>(
      [
        SELECT
          Id,
          Name,
          Amount__c,
          Category__c,
          Offer__c,
          Due_Date__c,
          Successfully_Paid__c
        FROM Bill__c
        WHERE User__r.Email__c = :UserInfo.getUserEmail()
      ]
    );
    if (bills.size() > 0) {
      return bills;
    } else {
      return null;
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Entry__c> getEntries() {
    List<Entry__c> ent = new List<Entry__c>(
      [
        SELECT
          Amount__c,
          Comment__c,
          Date_Time__c,
          Expense_Description__c,
          Flag_This__c,
          Id,
          Name
        FROM Entry__c
        WHERE User__r.Email__c = :UserInfo.getUserEmail()
      ]
    );

    if (ent.size() > 0) {
      return ent;
    } else {
      return null;
    }
  }

  @AuraEnabled
  public static boolean updateWallet(Wallet__c walle, Integer num, String str) {
    Wallet__c wallet = walle;
    Entry__c ent = new Entry__c(
      Amount__c = num,
      Expense_Description__c = str,
      User__c = wallet.User__c
    );
    insert ent;
    update wallet;
    return true;
  }

  @AuraEnabled
  public static boolean updateCard(Card__c car, Integer num, String str) {
    Card__c card = car;
    Entry__c ent = new Entry__c(
      Amount__c = num,
      Expense_Description__c = str,
      User__c = card.User__c
    );
    insert ent;
    update card;
    return true;
  }
}
