/*
Created By          : Girikon (Aman Mahto)
Created On          : Jan 5, 2025
@description        : This is test class of class OpportuintyOneWeekBeforeCloseDate.

Modification log --
Modified By         :
Modified On         :
@description        :
*/

@isTest
public class OpportunityOneWeekBeforeCloseDate_Test {
    
    @TestSetup
    static void testData(){
    
        List<Opportunity> oppList = new List<Opportunity>();
        List<Contact> contactList = new List<Contact>();
        List<OpportunityContactRole> opportunityContactRoleList = new List<OpportunityContactRole>();
        
        Account acc = new Account(Name='testAcc');
        
        insert acc;
        
        for(Integer i=0;i<5;i++){
            
            oppList.add(new Opportunity(Name='opp'+i,closeDate=date.newinstance(2025,1,4),StageName='Prospecting'));
            contactList.add(new Contact(LastName='Con'+i,Email='amanstmarks123@gmail.com',AccountId=acc.Id,Presenter__c=true));
        }
        
        insert oppList;
        insert contactList;
        
        Workshops__c ws1 = new Workshops__c(Organisation__c=acc.Id,Start_Date_Time__c= datetime.newInstance(2025,1,1),End_Date_Time__c=datetime.newInstance(2025,2,1),Presenter__c=contactList[0].Id,Number_of_Attendees__c=6,Opportunity__c=oppList[0].Id);
        Workshops__c ws2 = new Workshops__c(Organisation__c=acc.Id,Start_Date_Time__c= datetime.newInstance(2025,1,1),End_Date_Time__c=datetime.newInstance(2025,2,1),Presenter__c=contactList[1].Id,Number_of_Attendees__c=9,Opportunity__c=oppList[0].Id);
       
        insert ws1;
        insert ws2;
        
        for(Integer i=0;i<3;i++){
            
            opportunityContactRoleList.add(new OpportunityContactRole(ContactId=contactList[0].Id,OpportunityId=oppList[i].Id,IsPrimary=true));	
         }
        
        insert opportunityContactRoleList;    
    }
    
    @isTest
    static void testMailToPrimaryContact(){
         
        List<Opportunity> oppList = [Select Id,Name,CloseDate From Opportunity Where Name Like 'opp%'];
        
        Test.startTest();
        
        System.assertEquals(0, Limits.getEmailInvocations(), 'No emails should be sent');
        
        OpportuintyOneWeekBeforeCloseDate.sendMailToPrimaryContact(new List<List<Opportunity>>{oppList});
        
        System.assertEquals(1, Limits.getEmailInvocations(), 'Emails should be sent');
        
        Test.stopTest();
    }
}