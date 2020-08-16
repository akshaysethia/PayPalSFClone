trigger balanceTrigger on Wallet__c(after insert, after update) {
  if (Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate)) {
    List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();

    for (Wallet__c i : Trigger.new) {
      if (i.Balance__c < 500) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        List<String> sendTo = new List<String>();
        sendTo.add(i.Email__c);
        mail.setToAddresses(sendTo);

        mail.setReplyTo('as4106@srmist.edu.in');
        mail.setSenderDisplayName('PayPal Clone !');

        mail.setSubject('Balance Update !');
        String body = 'Dear ' + i.Email__c + ' User, ';
        body += 'Your Balance is lower than the Usual terms ';
        body += 'you had agreed upon during the initial Stages.';
        body += 'We Urge you to make a Top - Up to your wallet as soon as Possible !';
        body += 'Yours Sincerly, ';
        body += 'Akshay Sethia';
        body += 'Clone MD';

        mail.setHtmlBody(body);

        mails.add(mail);
      }
    }

    if (mails.size() > 0) {
      Messaging.sendEmail(mails);
    }
  }
}
