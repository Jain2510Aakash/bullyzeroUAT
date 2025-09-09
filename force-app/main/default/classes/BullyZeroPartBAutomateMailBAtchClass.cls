/*
Created By          : Girikon (Aman Mahto)
Created On          : Dec 24, 2024
@description        : This batch class is for extracting the leads who are not converted and whose leadsource is Booking Form and send mail to the leads.
Test Class          : 
 
Modification log --
Modified By         :
Modified On         :
@description        :
*/

public class BullyZeroPartBAutomateMailBAtchClass implements Database.Batchable<sObject> {
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        
        DateTime dt = System.Now().addHours(-1);
        String leadSource = 'Booking Form';
        
        return Database.getQueryLocator('Select Id,Name,Mail_Sent__c,Email From Lead Where IsConverted=false AND LeadSource=:leadSource AND Mail_Sent__c=false AND CreatedDate <= :dt AND Filled_By_Bully_Zero__c = false');     
    }
    
    public void execute(Database.BatchableContext bc, List<Lead> leadList){
        System.debug(leadList);
        System.debug('Size'+leadList.size());
        
        sendSingleEmail.sendSingleEmailMethod(leadList);  
    }
    
    public void finish(Database.BatchableContext bc){
        
        system.debug('Finish');    
    }
}