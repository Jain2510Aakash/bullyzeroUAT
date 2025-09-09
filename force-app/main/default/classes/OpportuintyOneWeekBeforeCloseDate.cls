/*
Created By          : Girikon (Aman Mahto)
Created On          : Dec 27, 2024
@description        : This class contains an invocable method which sends mail to Primary contact of each opportunity.Mail contains workshop details related to opportunity and Name of Primary Contact.
Test Class          : OpportunityOneWeekBeforeCloseDate_Test (Coverage: 97%)
 
Modification log --
Modified By         :
Modified On         :
@description        :
*/
public class OpportuintyOneWeekBeforeCloseDate {
    
    @InvocableMethod(label='Mail To PrimaryContact ' description='Send Mail To Primary Contact One Week Before Close Date Of Opportunity ' category='Opportunity')
    public static void sendMailToPrimaryContact(List<List<Opportunity>> opportunityList) {
        
        List<EmailTemplate> etList = [SELECT Id, Subject, HtmlValue FROM EmailTemplate WHERE DeveloperName = 'Email_For_Opportunity_One_Week_Before_Close_Date_1735214901440'];
        String sendersEmail = System.label.Sender_s_Email_Address; 
        List<OrgWideEmailAddress> oweaList = [SELECT Id FROM OrgWideEmailAddress WHERE Address = :sendersEmail];
        List<Messaging.SingleEmailMessage> allmsg = new List<Messaging.SingleEmailMessage>();
        
        Map<Id, String> opportWorkshopstringMap = new Map<Id, String>();
        List<Workshops__c> workshopsList = [SELECT End_Date_Time__c, Number_of_Attendees__c, Presenter__r.Name, Start_Date_Time__c,Program__r.Name, Year_Level__c, Opportunity__r.Id, Presentation_Duration_In_Minutes__c FROM Workshops__c WHERE Opportunity__r.Id IN :opportunityList[0] ORDER BY Start_Date_Time__c];
        List<Opportunity> newOpportList = [SELECT Id,closeDate,(SELECT Id, Presenter__r.Name FROM Workshops__r), (SELECT IsPrimary, ContactId, Contact.Name FROM OpportunityContactRoles WHERE IsPrimary = true) FROM Opportunity WHERE Id IN :opportunityList[0]];
        
        string table = '<table><tr><th style="padding: 3px;">Facilitator Name</th><th style="padding: 3px;">Program Name</th><th style="padding: 3px;">Year Level</th><th style="padding: 3px;">No. of Attendees</th><th style="padding: 3px;">Date</th><th style="padding: 3px;">Time</th><th style="padding: 3px;">Presentation Duration (In Minutes)</th></tr>';
        
        for (Workshops__c wc : workshopsList) {
            
             String temp = '<tr>' + '<td style="padding: 3px;">' + (wc.Presenter__c != null ? wc.Presenter__r.Name : ' ') + '</td>'+ '<td style="padding: 3px;">' + (wc.Program__c != null ? wc.Program__r.Name : ' ') + '</td>' +
                           '<td style="padding: 3px;">' +(wc.Year_Level__c != null ? wc.Year_Level__c : ' ') + '</td>' +'<td style="text-align: center;padding: 3px;">' +(wc.Number_of_Attendees__c != null ? wc.Number_of_Attendees__c :0) + '</td>' + '<td style="padding: 3px;">' + (wc.Start_Date_Time__c != null ?  wc.Start_Date_Time__c.date().format() : ' ') + '</td>' + '<td style="padding: 3px;">' + (wc.Start_Date_Time__c != null ? wc.Start_Date_Time__c.format('h:mm a') : ' ') + '</td>' + '<td style="text-align: center;padding: 3px;">' + (wc.Presentation_Duration_In_Minutes__c != null ? wc.Presentation_Duration_In_Minutes__c : ' ') + '</td>' + '</tr>'; 
                        
            if (!opportWorkshopstringMap.containsKey(wc.Opportunity__r.Id)) {
                
                opportWorkshopstringMap.put(wc.Opportunity__r.Id, temp);
                } 
            else {
                
                opportWorkshopstringMap.put(wc.Opportunity__r.Id, opportWorkshopstringMap.get(wc.Opportunity__r.Id) + temp);
            }
        }
        
        for(Opportunity opp : newOpportList) {
            
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            
            if (!etList.isEmpty()) {
                
                String htmlbody = etList[0].HtmlValue;
                htmlbody = htmlbody.replace('{{{CloseDate}}}',opp.closeDate.format());
                
                if(!opp.OpportunityContactRoles.isEmpty()){
                    
                    htmlbody = htmlbody.replace('{{{ContactName}}}', opp.OpportunityContactRoles[0].Contact.Name);
                    mail.setTargetObjectId(opp.OpportunityContactRoles[0].ContactId);
                    mail.setSaveAsActivity(true);
                }
                
                else{
                    
                    htmlbody = htmlbody.replace('{{{ContactName}}}',' ');
                }
                
                if (opportWorkshopstringMap.containsKey(opp.Id)) {
                    
                    htmlbody = htmlbody.replace('{{{Workshop}}}', table+opportWorkshopstringMap.get(opp.Id)+'</table>');
                    System.debug('Body2' + htmlbody);
               }
                else{
                    
                    htmlbody = htmlbody.replace('{{{Workshop}}}',' ');
                    System.debug('Body2' + htmlbody);
               }
                
                mail.setHtmlBody(htmlbody);
                mail.setSubject(etList[0].Subject);
            }
            
            if (!oweaList.isEmpty()) {
                
                mail.setOrgWideEmailAddressId(oweaList[0].Id);        
            }
            
            allmsg.add(mail);   
        }
        
        try {
            
            Messaging.SendEmailResult[] results = Messaging.sendEmail(allmsg, false);    
        } 
        catch (Exception e) {
            
            System.debug('hi error');
            System.debug('Exception type caught: ' + e.getTypeName());
            System.debug(e.getMessage());     
        }
        
    }
}