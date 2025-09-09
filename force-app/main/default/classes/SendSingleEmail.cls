/*
Created By          : Girikon (Aman Mahto)
Created On          : Dec 24, 2024
@description        : This class is for sending mail to leads and after successfully mail sent their (Form PartB Link Mail Sent) field update to true.
Test Class          : 
 
Modification log --
Modified By         :
Modified On         :
@description        :
*/

public class SendSingleEmail {
    
    public static void sendSingleEmailMethod(List<Lead>leadList) {
        
        List<Messaging.SingleEmailMessage> allmsg = new List<Messaging.SingleEmailMessage>();
        List<EmailTemplate> etList = [SELECT Id,Subject, Body FROM EmailTemplate WHERE DeveloperName ='Email_Template_For_Booking_Part_B']; 
        String sendersEmail = System.label.Sender_s_Email_Address; 
        List<OrgWideEmailAddress> oweaList = [select Id from OrgWideEmailAddress where Address = :sendersEmail];
        
        Messaging.SendEmailResult[] results = new Messaging.SendEmailResult[]{}; 
            
            for(Lead ld :leadList){
                
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                
                if(!etList.isEmpty()){
                    
                    mail.setTemplateId(etList[0].Id);
                }   
                mail.setTargetObjectId(ld.Id);
                mail.setSaveAsActivity(true);
                
                if ( !oweaList.isEmpty()) {
                    
                    mail.setOrgWideEmailAddressId(oweaList[0].Id);
                    
                }
                
                allmsg.add(mail);
            }
        
        
        try {
            
            results =  Messaging.sendEmail(allmsg,false);     
        }
        
        catch(Exception e) {
            
            System.debug('hi error');
            System.debug('Exception type caught: ' + e.getTypeName());    
            System.debug(e.getMessage());
            
        }
        
        List<Id> unsuccessMailLeadIdList = new List<Id>();
        List<Lead> successMailLeadList = new List<Lead>(); 
        
        for(Messaging.SendEmailResult msg : results){
            
            if(!msg.issuccess()){
                
                unsuccessMailLeadIdList.add(msg.getErrors()[0].getTargetObjectId());
            }         
        }
        
        system.debug('unsucess'+unsuccessMailLeadIdList);
        
        for(Lead ld: leadList){
            
            if(!unsuccessMailLeadIdList.contains(ld.id)){
                
                ld.Mail_Sent__c=true;
                successMailLeadList.add(ld);
            }       
        }  
        update successMailLeadList;
        
    }
    
}