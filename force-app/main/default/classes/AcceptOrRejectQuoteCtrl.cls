/*
Created By          : Girikon (Sahil)
Created On          : Jan 07, 2025
@description        : This class is a controller class for AcceptOrRejectQuote lwc.
Test Class          : AcceptOrRejectQuoteCtrl_Test (Coverage: __%)

Modification log --
Modified By         : 
Modified On         : 
@description        : 
*/
public without sharing class AcceptOrRejectQuoteCtrl 
{
    @AuraEnabled
    public static void updateQuote(String quoteId)
    {
        List<Quote> quote = [SELECT Id, Status FROM Quote WHERE Id = :quoteId];
        if(!quote.isEmpty())
        {
            quote[0].Status = 'Accepted';
            UPDATE quote[0];
        }
    }
}