public class fetchEntryData {
  @AuraEnabled(cacheable=true)
  public static List<Entry__c> gettingEntries() {
    return [SELECT Amount__c, Expense_Description__c FROM Entry__c];
  }
}
