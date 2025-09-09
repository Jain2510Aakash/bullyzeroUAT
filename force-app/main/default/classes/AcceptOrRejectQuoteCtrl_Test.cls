/*
Created By          : Girikon (Aman Mahto)
Created On          : Jan 15, 2025
@description        : This class is for testing  the class AcceptOrRejectQuoteCtrl.
 
Modification log --
Modified By         :
Modified On         :
@description        :
*/

@isTest
public class AcceptOrRejectQuoteCtrl_Test {
    
    @isTest 
    static void testupdateQuote(){
        
        Opportunity opp = new Opportunity(Name='testOpp',closeDate=Date.today().addDays(10),stageName='Establish Needs'); 
        insert opp;   
        
        Quote qt = new Quote(Name='testQuote',OpportunityId=opp.Id);  
        insert qt;
        
        Test.startTest();
        AcceptOrRejectQuoteCtrl.updateQuote(qt.Id);   
        Test.stopTest();  
        
        Quote updatedQuote = [Select Id,status,Name From Quote Where Id=:qt.Id];  
        Assert.areEqual('Accepted',updatedQuote.Status,'Quote status should be Accepted');  
        
    }        
}