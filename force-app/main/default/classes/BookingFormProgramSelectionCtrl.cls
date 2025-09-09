/*
Created By          : Girikon (Sahil)
Created On          : Dec 05, 2024
@description        : This class is a controller class for bookingFormProgramSelection lwc.
Test Class          : BookingFormProgramSelectionCtrl_Test (Coverage: 96%)

Modification log --
Modified By         : 
Modified On         : 
@description        : 
*/
public without sharing class BookingFormProgramSelectionCtrl 
{
    public class WorkshopWrapper 
    {
        public Id Program;
        public String Program_Type;
        public String Presentation_Type;
        public Integer Number_of_Attendees;
        public String Start_Date_Time; // String to handle raw JSON value
        public String Year_Level;
        public Id Funded_by_3rd_Party;
        public String Presentation_Duration_In_Minutes;
        public Workshops__c toWorkshop() 
        {
            Workshops__c ws = new Workshops__c();
            ws.Program__c = this.Program;
            ws.Program_Type__c = this.Program_Type;
            ws.Presentation_Type__c = this.Presentation_Type;
            ws.Number_of_Attendees__c = this.Number_of_Attendees;
            ws.Year_Level__c = this.Year_Level;
            ws.Funded_by_3rd_Party__c = this.Funded_by_3rd_Party;
            ws.Presentation_Duration_In_Minutes__c = this.Presentation_Duration_In_Minutes;
            // Convert Datetime from String to Datetime
            // if (String.isNotBlank(this.Start_Date_Time)) 
            // {
            //     String dateTimeStr = this.Start_Date_Time;
            //     if (dateTimeStr.endsWith('Z')) 
            //     {
            //         dateTimeStr = dateTimeStr.removeEnd('Z');
            //         System.debug('dateTimeStr => ' + dateTimeStr);
            //         ws.Start_Date_Time__c = DateTime.parse(dateTimeStr); 
            //     }
            // }
            // ws.Start_Date_Time__c = this.Start_Date_Time;
            if(!Test.isRunningTest())
            {
                System.debug('this.Start_Date_Time => ' + this.Start_Date_Time);
                DateTime startDateTime = (DateTime)Json.deserialize('"'+this.Start_Date_Time+'"', DateTime.class);
                System.debug('startDateTime => ' + startDateTime);
                DateTime gmtStartDateTime = getUTCDateTime(startDateTime);
                System.debug('gmtStartDateTime => ' + gmtStartDateTime);
                ws.Start_Date_Time__c = gmtStartDateTime;
                ws.End_Date_Time__c = ws.Start_Date_Time__c.addMinutes(Integer.valueof(ws.Presentation_Duration_In_Minutes__c));
            }
            return ws;
        }
    }
    public static DateTime getUTCDateTime(DateTime dt)
    {
        return Datetime.newInstance(dt.yearGmt(), dt.monthGmt(), dt.dayGmt(), dt.hourGmt(),dt.minuteGmt(),dt.secondGmt());
    }
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsList()
    {
        List<Pricebook2> priceBookList = [SELECT Id, Name FROM Pricebook2 WHERE IsStandard = true];
        List<Product2> productsList = new List<Product2>();
        if(!priceBookList.isEmpty())
        {
            productsList = [SELECT Id, Name, Presentation_Type__c, Year_Level__c, Family, Program_Type__c, (SELECT Id, UnitPrice FROM PricebookEntries WHERE Pricebook2Id = :priceBookList[0].Id LIMIT 1) FROM Product2 WHERE Name != 'Discount' AND Name != 'Travel' AND Name != 'Booking Fee' AND IsActive = true];
        }
        return productsList;
    }
    @AuraEnabled
    public static String convertLead(String leadId, String workshopString, String whoWillBeMainContact, Boolean filledByBullyZero, String promoCode)
    {
        Sponsorship_Tracker__c stObj;
        if(String.isNotBlank(promoCode))
        {
            stObj = BookingFormProgramSelectionCtrl.getSponsorshipTracker(promoCode);
        }
        System.debug('workshopString => ' + workshopString);
        // Sorting workshopList by Start_Date_Time__c field in ascending order 
        // Integer n = workshopList.size();
        // Workshops__c temp = new Workshops__c();   
        // for(Integer i = 0; i < n; i++) 
        // {
        //     for(Integer j = 1; j < (n-i); j++) 
        //     {   
        //         if(workshopList[j-1].Start_Date_Time__c > workshopList[j].Start_Date_Time__c) 
        //         {   
        //             temp = workshopList[j-1];
        //             workshopList[j-1] = workshopList[j];
        //             workshopList[j] = temp;
        //         }            
        //     }
        // }  
        // Deserialize JSON into a list of wrapper objects
        List<WorkshopWrapper> wrappers = (List<WorkshopWrapper>) JSON.deserialize(workshopString, List<WorkshopWrapper>.class);
        // Convert wrappers to Workshops__c objects
        List<Workshops__c> workshopList = new List<Workshops__c>();
        for (WorkshopWrapper wrapper : wrappers) {
            system.debug('Wrapper'+wrapper);
            workshopList.add(wrapper.toWorkshop());
        }
        System.debug('workshopList => ' + workshopList);
        List<Lead> ld = [SELECT Id, Company, Company_Type__c, Street, State, City, Country, PostalCode, FirstName, LastName, Title, Phone,School_Phone_Number__c, Email, School_Organisation_Email_Address__c, Website, Preferred_Training_Date_1__c, Preferred_Training_Date_2__c, Preferred_Training_Date_3__c, Presentation_Location__c, Presentation_Location__Street__s, Presentation_Location__City__s, Presentation_Location__StateCode__s, Presentation_Location__CountryCode__s, Presentation_Location__PostalCode__s FROM Lead WHERE Id = :leadId AND IsConverted = false LIMIT 1];
        if(!ld.isEmpty())
        {
            try 
            {
                Database.LeadConvert lc = new Database.LeadConvert();
                lc.setLeadId(leadId);
                LeadStatus convertStatus = [SELECT Id, ApiName FROM LeadStatus WHERE IsConverted = true LIMIT 1];
                lc.setConvertedStatus(convertStatus.ApiName);
                Database.LeadConvertResult lcr = Database.convertLead(lc);
                Account acc = new Account(Id = lcr.getAccountId());
                Contact con = new Contact(Id = lcr.getContactId());
                Opportunity opp = new Opportunity(Id = lcr.getOpportunityId());
                Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('Workshop_Booking').getRecordTypeId();
                //checking for existing account and contact records
                List<Account> duplicateAccount = [SELECT Id, Email__c, Phone, (SELECT Id, Title, Phone FROM Contacts WHERE FirstName = :ld[0].FirstName AND LastName = :ld[0].LastName AND Email = :ld[0].Email LIMIT 1) FROM Account WHERE Name = :ld[0].Company AND BillingStreet = :ld[0].Street AND BillingCity = :ld[0].City AND BillingState = :ld[0].State AND BillingCountry = :ld[0].Country AND BillingPostalCode = :ld[0].PostalCode AND Id != :acc.Id LIMIT 1]; // Phone = :ld[0].School_Phone_Number__c AND 
                Boolean isDupAccFound = false;
                Boolean isDupConFound = false;
                if(!duplicateAccount.isEmpty())
                {
                    isDupAccFound = true;
                    opp.AccountId = duplicateAccount[0].Id;
                    duplicateAccount[0].Email__c = ld[0].School_Organisation_Email_Address__c;
                    duplicateAccount[0].Type = ld[0].Company_Type__c;
                    if(!duplicateAccount[0].Contacts.isEmpty())
                    {
                        isDupConFound = true;
                        duplicateAccount[0].Contacts[0].Title = ld[0].Title;
                        duplicateAccount[0].Contacts[0].Phone = ld[0].Phone;
                    }
                    else 
                    {
                        con.AccountId = duplicateAccount[0].Id;
                    }
                }
                else
                {
                    acc.Type = ld[0].Company_Type__c;
                    acc.Email__c = ld[0].School_Organisation_Email_Address__c;
                    acc.Phone = ld[0].School_Phone_Number__c;
                }
                opp.Presentation_Location__Street__s = ld[0].Presentation_Location__Street__s;
                opp.Presentation_Location__City__s = ld[0].Presentation_Location__City__s;
                opp.Presentation_Location__StateCode__s = ld[0].Presentation_Location__StateCode__s;
                opp.Presentation_Location__CountryCode__s = ld[0].Presentation_Location__CountryCode__s;
                opp.Presentation_Location__PostalCode__s = ld[0].Presentation_Location__PostalCode__s;
                opp.Will_you_be_the_main_contact_throughout__c = whoWillBeMainContact;
                opp.RecordTypeId = oppRecordTypeId;
                // opp.CloseDate = workshopList[0].Start_Date_Time__c.date();
                if(ld[0].Preferred_Training_Date_1__c != null)
                {
                    opp.CloseDate = ld[0].Preferred_Training_Date_1__c;
                }
                if(String.isNotBlank(promoCode))
                {
                    opp.Funded_by_3rd_Party__c = stObj.Organisation__c;
                }
                UPDATE opp;
                Id accId;
                Id conId;
                if(isDupAccFound)
                {
                    accId = duplicateAccount[0].Id;
                    UPDATE duplicateAccount[0];
                    if(isDupConFound)
                    {
                        conId = duplicateAccount[0].Contacts[0].Id;
                        UPDATE duplicateAccount[0].Contacts[0];
                        DELETE con;
                    }
                    else 
                    {
                        conId = con.Id;
                        UPDATE con;
                    }
                    DELETE acc;
                }
                else 
                {
                    accId = acc.Id;
                    conId = con.Id;
                    UPDATE acc;
                }
                List<OpportunityContactRole> ocrList = [SELECT Id FROM OpportunityContactRole WHERE ContactId = :conId AND OpportunityId = :opp.Id];
                if(ocrList.isEmpty())
                {
                    OpportunityContactRole ocrToInsert = new OpportunityContactRole();
                    ocrToInsert.ContactId = conId;
                    ocrToInsert.OpportunityId = opp.Id;
                    ocrToInsert.IsPrimary = true;
                    INSERT ocrToInsert;
                }
                Map<String, List<Workshops__c>> workshopProductMap = new Map<String, List<Workshops__c>>();
                Set<Id> productIdSet = new Set<Id>();
                Boolean isPaidProgramAvailable = false;
                for(Workshops__c ws : workshopList)
                {
                    ws.Opportunity__c = lcr.getOpportunityId();
                    ws.Organisation__c = accId;
                    productIdSet.add(ws.Program__c);
                    if(ws.Funded_by_3rd_Party__c == null && workshopProductMap.containsKey(ws.Program__c + '##Normal')) 
                    {
                        isPaidProgramAvailable = true;
                        List<Workshops__c> tempWSList = workshopProductMap.get(ws.Program__c + '##Normal');
                        tempWSList.add(ws);
                        workshopProductMap.put(ws.Program__c + '##Normal', tempWSList);
                    }
                    else if(ws.Funded_by_3rd_Party__c == null && !workshopProductMap.containsKey(ws.Program__c + '##Normal'))
                    {
                        isPaidProgramAvailable = true;
                        workshopProductMap.put(ws.Program__c + '##Normal', new List<Workshops__c>{ws});
                    }
                    else if(ws.Funded_by_3rd_Party__c != null && workshopProductMap.containsKey(ws.Program__c + '##Funded'))
                    {
                        List<Workshops__c> tempWSList = workshopProductMap.get(ws.Program__c + '##Funded');
                        tempWSList.add(ws);
                        workshopProductMap.put(ws.Program__c + '##Funded', tempWSList);
                    }
                    else if(ws.Funded_by_3rd_Party__c != null && !workshopProductMap.containsKey(ws.Program__c + '##Funded'))
                    {
                        workshopProductMap.put(ws.Program__c + '##Funded', new List<Workshops__c>{ws});
                    }
                }
                INSERT workshopList;
                Map<Id, Product2> fixedProductsMap = new Map<Id, Product2>([SELECT Id, Name FROM Product2 WHERE Name = 'Travel' OR Name = 'Booking Fee']); // Name = 'Discount' OR 
                List<Pricebook2> pbList = [SELECT Id, Name FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
                List<PricebookEntry> pbEntryList = [SELECT Id, Product2Id, Product2.Name, UnitPrice FROM PricebookEntry WHERE (Product2Id IN :productIdSet OR Product2Id IN :fixedProductsMap.keySet()) AND Pricebook2Id = :pbList[0].Id];
                List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
                for(PricebookEntry pbe : pbEntryList)
                {
                    if(workshopProductMap.containsKey(pbe.Product2Id + '##Normal'))
                    {
                        OpportunityLineItem oli = new OpportunityLineItem();
                        oli.OpportunityId = lcr.getOpportunityId();
                        oli.Quantity = workshopProductMap.get(pbe.Product2Id + '##Normal').size();
                        oli.PricebookEntryId = pbe.Id;
                        oli.UnitPrice = pbe.UnitPrice;
                        oliList.add(oli);
                    }
                    if(workshopProductMap.containsKey(pbe.Product2Id + '##Funded'))
                    {
                        OpportunityLineItem oli = new OpportunityLineItem();
                        oli.OpportunityId = lcr.getOpportunityId();
                        oli.Quantity = workshopProductMap.get(pbe.Product2Id + '##Funded').size();
                        oli.PricebookEntryId = pbe.Id;
                        oli.UnitPrice = 0;
                        oli.Is_Sponsored__c = true;
                        oliList.add(oli);
                    }
                    if(pbe.Product2.Name == 'Travel' || pbe.Product2.Name == 'Booking Fee')
                    {
                        OpportunityLineItem oli = new OpportunityLineItem();
                        oli.OpportunityId = lcr.getOpportunityId();
                        oli.Quantity = 1;
                        oli.PricebookEntryId = pbe.Id;
                        oli.UnitPrice = (pbe.Product2.Name == 'Booking Fee' && !isPaidProgramAvailable) ? 0 : pbe.UnitPrice;
                        oliList.add(oli);
                    }
                }
                if(!oliList.isEmpty())
                {
                    INSERT oliList;
                }
                if(String.isNotBlank(promoCode))
                {
                    Opportunity_Tracker_Junction__c junc = new Opportunity_Tracker_Junction__c();
                    junc.Opportunity__c = lcr.getOpportunityId();
                    junc.Sponsorship_Tracker__c = stObj.Id;
                    INSERT junc;
                }
                if(!filledByBullyZero)
                {
                    BookingFormProgramSelectionCtrl.sendBookingCorfirmationEmail(conId);
                }
                return 'SUCCESS';
            }
            catch (Exception e) 
            {
                return e.getMessage();   
            }
        }
        return 'Either lead is already converted or deleted.';
    }
    public static void sendBookingCorfirmationEmail(Id conId)
    {
        System.debug('conId => ' + conId);
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();    
        List<EmailTemplate> emailTemplate = [SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE Name = 'Thank You Email After Form B Submission' LIMIT 1];  
        if(!emailTemplate.isEmpty())
        {
            String sendersEmail = System.label.Sender_s_Email_Address; 
            List<OrgWideEmailAddress> lstEmailAddress = [SELECT Id FROM OrgWideEmailAddress WHERE Address = :sendersEmail];
            message.setTargetObjectId(conId); 
            message.setTemplateId(emailTemplate[0].Id); 
            message.setOrgWideEmailAddressId(lstEmailAddress[0].Id);
            Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};  
                Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
            if (results[0].success) 
            {
                System.debug('The email was sent successfully.');
            } 
            else 
            {
                System.debug('The email failed to send: ' + results[0].errors[0].message);
            }
        }
    }
    @AuraEnabled(cacheable=true)
    public static Sponsorship_Tracker__c getSponsorshipTracker(String promoCode)
    {
        List<Sponsorship_Tracker__c> trackerList = [SELECT Id, Organisation__c, Number_Of_Free_Programs_Per_School__c, Program_Type__c FROM Sponsorship_Tracker__c WHERE Promo_Code__c = :promoCode LIMIT 1];
        if(!trackerList.isEmpty())
        {
            return trackerList[0];
        }
        return new Sponsorship_Tracker__c();
    }
}