/*
Created By          : Girikon (Aman Mahto)
Created On          : Jan 03, 2025
@description        : This class is for testing  the ScheduleBullyZeroMailSendClass.
 
Modification log --
Modified By         :
Modified On         :
@description        :
*/

@isTest
public class ScheduleBullyZeroMailSendClass_Test {
    
    @testSetup
    static void testData(){
        
        List<Lead> leadList = new List<Lead>();
        
        for(Integer i=0;i<5;i++){
            
            leadList.add(new Lead(LastName='testLead'+i,Mail_Sent__c=false,Company='Girikon',LeadSource='Booking Form',Status='Identified',Email='amanstmarks123@gmail.com'));
        }
        
        insert leadList;
        
        for(Lead ld : leadList){
            
            Test.setCreatedDate(ld.Id, Date.today().addDays(-1));
        }       
    }
        
    @isTest
    static void testSchedulingOFBatchClass(){
        
        Test.startTest();
        
        string jobId = System.schedule('Testschedule','0 0 0 * * ? *', new ScheduleBullyZeroMailSendClass());
        
        Test.stopTest();
              
        List<AsyncApexJob> jobsScheduled = [select Id, ApexClassID, ApexClass.Name, Status, JobType from AsyncApexJob where JobType = 'ScheduledApex'];
        System.assertEquals(1, jobsScheduled.size(), 'expecting one scheduled job');
        System.assertEquals('ScheduleBullyZeroMailSendClass', jobsScheduled[0].ApexClass.Name, 'expecting specific scheduled job');
        
        List<AsyncApexJob> jobsApexBatch = [select Id, ApexClassID, ApexClass.Name, Status, JobType from AsyncApexJob where JobType = 'BatchApex'];
        System.assertEquals(1, jobsApexBatch.size(), 'expecting one apex batch job');
        System.assertEquals('BullyZeroPartBAutomateMailBAtchClass', jobsApexBatch[0].ApexClass.Name, 'expecting specific batch job');     
    }  
}