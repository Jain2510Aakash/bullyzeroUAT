/*
Created By          : Girikon (Aman)
Created On          : Jan 07, 2025
@description        : This class is a test class for BookingFormProgramSelectionCtrl .

Modification log --
Modified By         : 
Modified On         : 
@description        : 
*/

@isTest
public class BookingFormProgramSelectionCtrl_Test {
    
    @testSetup
    static void testData(){
        
        Id pricebookId = Test.getStandardPricebookId();
        Pricebook2 standardPricebook = new Pricebook2(
            Id = pricebookId,
            IsActive = true
        );
        update standardPricebook;
        
        Product2 prod1 = new Product2(Name='testProd',Presentation_Type__c='Face To Face',Family='It Takes A Village Program',IsActive=true);
        Product2 prod2 = new Product2(Name='Booking Fee',Presentation_Type__c='Face To Face',Family='It Takes A Village Program',IsActive=true);
        
        insert prod1;
        insert prod2;
        
        List<PricebookEntry> prBookEntryList = new List<PricebookEntry>{new PricebookEntry(Pricebook2Id=standardPricebook.Id,Product2Id=prod1.Id,UnitPrice=300,IsActive=true),new PricebookEntry(Pricebook2Id=standardPricebook.Id,Product2Id=prod2.Id,UnitPrice=600,IsActive=true)};
         insert prBookEntryList;    
    }
    
    @isTest
    static void testgetProductsList(){
        
        List<Product2> prodList = new List<Product2>();
        
        Test.startTest();
        prodList = BookingFormProgramSelectionCtrl.getProductsList();
        Test.stopTest();
        
        Assert.isTrue(prodList.size()>0);
    }
    
    @isTest
    static void testconvertLeadWithDublicateAccountAndContact(){
        
        Lead ld = new Lead(FirstName='test',LastName='Lead',Company='Girikon',School_Organisation_Email_Address__c='xyz@gmail.com',Email='xyz@gmail.com',Company_Type__c='High School',Title='Mr.',Phone='9871195655',Presentation_Location__Street__s='B-24 Noida');
        insert ld;
        
        Product2 prod = [Select Id,Name From Product2 Where Name='testProd' LIMIT 1];
        List<Workshops__c> WorkshopList = new List<Workshops__c>{new Workshops__c(Start_Date_Time__c=Datetime.now().addHours(1),Program__c=prod.Id),new Workshops__c(Start_Date_Time__c=Datetime.now(),Program__c=prod.Id)};
        Account acc = new Account(Name='Girikon');
        
        insert acc;
        
        Contact con = new  Contact(FirstName='test',LastName='Lead',Email='xyz@gmail.com',AccountId=acc.Id); 
        insert con;  
        
        string response;
        
        List<BookingFormProgramSelectionCtrl.WorkshopWrapper> WorkshopWrapperList = new List<BookingFormProgramSelectionCtrl.WorkshopWrapper>();
        
        BookingFormProgramSelectionCtrl.WorkshopWrapper workwrap1 = new BookingFormProgramSelectionCtrl.WorkshopWrapper();   
        BookingFormProgramSelectionCtrl.WorkshopWrapper workwrap2 = new BookingFormProgramSelectionCtrl.WorkshopWrapper(); 
        
        workwrap1.Program=WorkshopList[0].Program__c;
        workwrap1.Start_Date_Time=string.valueOf(WorkshopList[0].Start_Date_Time__c);
        
        workwrap2.Program=WorkshopList[1].Program__c;
        workwrap2.Start_Date_Time=string.valueOf(WorkshopList[1].Start_Date_Time__c);        
        
        WorkshopWrapperList.add(workwrap1);
        WorkshopWrapperList.add(workwrap2);
        
        string jsonWorkshopList = JSON.serialize(WorkshopWrapperList);
        
        Test.startTest();
        response = BookingFormProgramSelectionCtrl.convertLead(ld.Id,jsonWorkshopList,'Naman', false, '');
        System.assertEquals(1, Limits.getEmailInvocations(), 'Emails should be sent');
        Test.stopTest();
        
        List<Opportunity> oppList = [Select id,AccountId,Name From Opportunity Where AccountId=:acc.Id];
        List<OpportunityContactRole> oppConRoleList = [Select Id From OpportunityContactRole Where ContactId=:con.Id AND IsPrimary=true];
        Contact updatedCon = [SELECT Id, Title, Phone FROM Contact WHERE Id = :con.Id LIMIT 1];
        
        System.assertEquals('SUCCESS',response,'SUCCESS should return');
        System.assertEquals(oppList.size(),1,'One Opportunity is linked to Account');
        System.assertEquals(updatedCon.Phone,'9871195655','Contact Phone should be updates to Lead Phone');
        System.assertEquals(oppConRoleList.size(),1,'One record should be created');
    }
    
    @isTest
    static void testconvertLeadWithoutDublicateAccountAndContact(){
        
        Lead ld = new Lead(FirstName='test',LastName='Lead',Company='Girikon',School_Organisation_Email_Address__c='xyz@gmail.com',Company_Type__c='High School',Title='Mr.',Phone='9871195655',Presentation_Location__Street__s='B-24 Noida');
        insert ld;
        
        Product2 prod = [Select Id,Name From Product2 Where Name='testProd' LIMIT 1];
        List<Workshops__c> WorkshopList = new List<Workshops__c>{new Workshops__c(Start_Date_Time__c=Datetime.now().addHours(1),Program__c=prod.Id),new Workshops__c(Start_Date_Time__c=Datetime.now(),Program__c=prod.Id)};
        string response;
        
        List<BookingFormProgramSelectionCtrl.WorkshopWrapper> WorkshopWrapperList = new List<BookingFormProgramSelectionCtrl.WorkshopWrapper>();
        
        BookingFormProgramSelectionCtrl.WorkshopWrapper workwrap1 = new BookingFormProgramSelectionCtrl.WorkshopWrapper();
        BookingFormProgramSelectionCtrl.WorkshopWrapper workwrap2 = new BookingFormProgramSelectionCtrl.WorkshopWrapper();
        
        workwrap1.Program=WorkshopList[0].Program__c;
        workwrap1.Start_Date_Time=string.valueOf(WorkshopList[0].Start_Date_Time__c);
        
        workwrap2.Program=WorkshopList[1].Program__c;
        workwrap2.Start_Date_Time=string.valueOf(WorkshopList[1].Start_Date_Time__c);        
        
        WorkshopWrapperList.add(workwrap1);
        WorkshopWrapperList.add(workwrap2);
        
        string jsonWorkshopList = JSON.serialize(WorkshopWrapperList);
        Test.startTest();
        response = BookingFormProgramSelectionCtrl.convertLead(ld.Id,jsonWorkshopList,'Naman', false, '');
        System.assertEquals(0, Limits.getEmailInvocations(), 'Emails should not be sent');
        Test.stopTest();
    }    
}