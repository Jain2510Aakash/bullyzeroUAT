/*
Created By          : Girikon (Aman Mahto)
Created On          : Jan 15, 2025
@description        : This class is a test class for class CreateEventsForFacilitators.

Modification log --
Modified By         : 
Modified On         : 
@description        : 
*/

@isTest
public class CreateEventsForFacilitators_Test {
    
    @testSetup
    static void testData(){
        
        Account acc = new Account(Name='testAcc');
        
        insert acc;  
        
        List<Contact> contactList = new List<Contact>();
        
        for(Integer i=0;i<3;i++){
            
            contactList.add(new Contact(LastName='Con'+i,Email='amanstmarks123@gmail.com',AccountId=acc.Id,Presenter__c=true));
        }
        
        contactList[2].Email='sahil.294@gmail.com';  
        insert contactList;
        
        Opportunity opp = new Opportunity(Name='testOpp',closeDate=Date.today().addDays(10),stageName='Establish Needs',AccountId=acc.Id,Where_will_the_program_be_held__c='Other Location',other_Location__c='Basement'); 
        insert opp;
        
        Workshops__c ws1 = new Workshops__c(Organisation__c=acc.Id,Start_Date_Time__c= datetime.now(),End_Date_Time__c=datetime.now().addDays(10),Presenter__c=contactList[0].Id,Number_of_Attendees__c=6);
        Workshops__c ws2 = new Workshops__c(Organisation__c=acc.Id,Presenter__c=contactList[1].Id,Number_of_Attendees__c=9);
        Workshops__c ws3 = new Workshops__c(Organisation__c=acc.Id,Start_Date_Time__c= datetime.now().addHours(1),End_Date_Time__c=datetime.now().addDays(3),Number_of_Attendees__c=15);
        Workshops__c ws4 = new Workshops__c(Organisation__c=acc.Id,Start_Date_Time__c= datetime.now(),End_Date_Time__c=datetime.now().addDays(5),Presenter__c=contactList[1].Id);  
        
        insert ws1;
        insert ws2;
        insert ws3;
        insert ws4;     
    }
    
    @isTest
    static void testcreateEvents(){
        
        Opportunity opp = [Select Id,Name,closeDate,AccountId,Where_will_the_program_be_held__c,other_Location__c From Opportunity Where Name='testOpp'];
        
        List<Workshops__c> workshopList = [Select Organisation__c,Start_Date_Time__c,End_Date_Time__c,Presenter__c,Number_of_Attendees__c,Opportunity__c From Workshops__c Where Start_Date_Time__c!=NULL AND Presenter__c!=NULL];
        
        for(Workshops__c wc : workshopList){
            
            wc.Opportunity__c=opp.Id;       
        }
        
        update workshopList;
        
        Test.startTest();
        List<string> stringList = CreateEventsForFacilitators.createEvents(new List<Id>{opp.Id});
        Test.stopTest();
        
        List<Event> eventList = [Select Subject,WhatId,WhoId From Event Where WhatId=:opp.Id];
        List<EventRelation> eventRelationList = [Select Id,EventId From EventRelation];
        
        Assert.areEqual(1,eventList.size(),'One event should be created');
        Assert.areEqual(2,eventRelationList.size(),'Three event relation object is created.');
        Assert.areEqual('Calender Events are created for the facilitators for the Workshops available under this Opportunity.',stringList[0]);
        
    }
    
    @isTest
    static void testcreateEventsWithWorkshopNotHAvingStartDate(){
        
        Opportunity opp = [Select Id,Name,closeDate,AccountId,Where_will_the_program_be_held__c,other_Location__c From Opportunity Where Name='testOpp'];
        List<Workshops__c> workshopList = [Select Organisation__c,Start_Date_Time__c,End_Date_Time__c,Presenter__c,Number_of_Attendees__c,Opportunity__c From Workshops__c Where Start_Date_Time__c=NULL];
        
        for(Workshops__c wc : workshopList){
            
            wc.Opportunity__c=opp.Id;
        }
        
        update workshopList;
        
        Test.startTest();
        List<string> stringList = CreateEventsForFacilitators.createEvents(new List<Id>{opp.Id});
        Test.stopTest();
        
        List<Event> eventList = [Select Subject,WhatId,WhoId From Event Where WhatId=:opp.Id];
        List<EventRelation> eventRelationList = [Select Id,EventId From EventRelation];
        
        Assert.areEqual(0,eventList.size(),'No event should be created');
        Assert.areEqual(0,eventRelationList.size(),'No event relation object is created.');
        Assert.areEqual('Please populate a value first in \'Start Date & Time\' field for every Workshop record available under this Opportunity.',stringList[0]);
    }  
    
    @isTest
    static void testcreateEventsWithWorkshopNotHAvingPresenter(){
        
        Opportunity opp = [Select Id,Name,closeDate,AccountId,Where_will_the_program_be_held__c,other_Location__c From Opportunity Where Name='testOpp'];  
        List<Workshops__c> workshopList = [Select Organisation__c,Start_Date_Time__c,End_Date_Time__c,Presenter__c,Number_of_Attendees__c,Opportunity__c From Workshops__c Where Presenter__c=NULL];
        
        for(Workshops__c wc : workshopList){
            
            wc.Opportunity__c=opp.Id;
        }
        
        update workshopList;
        
        Test.startTest();
        List<string> stringList = CreateEventsForFacilitators.createEvents(new List<Id>{opp.Id});
        Test.stopTest();
        
        List<Event> eventList = [Select Subject,WhatId,WhoId From Event Where WhatId=:opp.Id];
        List<EventRelation> eventRelationList = [Select Id,EventId From EventRelation];
        
        Assert.areEqual(0,eventList.size(),'No event should be created');
        Assert.areEqual(0,eventRelationList.size(),'No event relation object is created.');
        Assert.areEqual('Please populate a value first in \'Presenter\' field for every Workshop record available under this Opportunity.',stringList[0]);
        
    }  
    
    @isTest
    static void testOpportunityWithoutWorkshop(){
        
        Opportunity opp = [Select Id,Name,closeDate,AccountId,Where_will_the_program_be_held__c,other_Location__c From Opportunity Where Name='testOpp'];
        Test.startTest();
        List<string> stringList = CreateEventsForFacilitators.createEvents(new List<Id>{opp.Id});
        Test.stopTest();
        
        List<Event> eventList = [Select Subject,WhatId,WhoId From Event Where WhatId=:opp.Id];
        
        Assert.areEqual(0,eventList.size(),'No event should be created');
        Assert.areEqual('There are no Workshop records available for this Opportunity.',stringList[0]); 
    }
}