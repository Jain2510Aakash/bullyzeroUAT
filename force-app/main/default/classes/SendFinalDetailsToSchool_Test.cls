/*
Created By          : Girikon (Sahil)
Created On          : Feb 28, 2025
@description        : This class is a test class for SendFinalDetailsToSchool class.

Modification log --
Modified By         : 
Modified On         : 
@description        : 
*/
@isTest
private class SendFinalDetailsToSchool_Test 
{
    @TestSetup
    static void makeData()
    {
        Account acc = new Account(Name = 'Test Acc');
        INSERT acc;
        Opportunity opp = new Opportunity(Name = 'Test Opp', CloseDate = Date.newinstance(2025,1,4), StageName = 'Prospecting', AccountId = acc.Id);
        INSERT opp;
        Contact con = new Contact(LastName = 'TestCon', Email = 'amanstmarks123@gmail.com', AccountId = acc.Id, Presenter__c = true);
        INSERT con;
        Workshops__c ws1 = new Workshops__c(Organisation__c = acc.Id, Start_Date_Time__c = DateTime.newInstance(2025,1,1), End_Date_Time__c = DateTime.newInstance(2025,2,1), Presenter__c = con.Id, Number_of_Attendees__c = 6, Opportunity__c = opp.Id);
        Workshops__c ws2 = new Workshops__c(Organisation__c = acc.Id, Start_Date_Time__c = DateTime.newInstance(2025,1,1), End_Date_Time__c = DateTime.newInstance(2025,2,1), Presenter__c = con.Id, Number_of_Attendees__c = 9,Opportunity__c = opp.Id);
        INSERT ws1;
        INSERT ws2;
        Quote qt = new Quote(Name = 'Test Quote', OpportunityId = opp.Id, ContactId = con.Id, Status = 'Accepted');  
        INSERT qt;
    }
    @isTest
    static void sendFinalDetailsEmailTest()
    {
        List<Opportunity> oppList = [SELECT Id FROM Opportunity LIMIT 1];
        Test.startTest();
        SendFinalDetailsToSchool.sendFinalDetailsEmail(new List<Id>{oppList[0].Id});
        Test.stopTest();
    }
}