/*
Created By          : Girikon (Sahil)
Created On          : Jan 27, 2025
@description        : This class is a outer class for an InvocableMethod used in a flow to send all the details to schools after Booking Form C.
Test Class          : SendFinalDetailsToSchool_Test (Coverage: __%)

Modification log --
Modified By         : 
Modified On         : 
@description        : 
*/
public without sharing class SendFinalDetailsToSchool 
{
    @InvocableMethod(label='Send Final Details To School' description='Send all the final details to schools after Booking Form C.')
    public static void sendFinalDetailsEmail(List<Id> ids) 
    {
        System.debug('ids => ' + ids);
        List<Opportunity> oppList = [SELECT Id, Name, Will_you_be_the_main_contact_throughout__c, Who_will_meet_presenter_at_reception__c, Anything_of_sensitivity__c, Student_numbers_for_each_session__c, Can_you_have_an_IT_member_available__c, Person_allocated_for_tech_support__c, Where_can_the_presenter_park__c, Where_will_the_program_be_held__c, other_Location__c, AccountId, Account.Name, Do_you_have_audio_visual_equipment__c, To_whom_shall_the_invoice_be_sent_to__c, To_whom_shall_the_invoice_be_sent_to__r.Name, To_whom_shall_the_invoice_be_sent_to__r.Email, Will_you_raise_a_PO_for_this_booking__c, Purchase_Order_Number__c, (SELECT Id, Name, Number_of_Attendees__c, Presenter__c, Presenter__r.Name, Program__c, Program__r.Name, Program_Type__c, Start_Date_Time__c, Year_Level__c , Presentation_Type__c, Organisation__c, Organisation__r.Name, Funded_by_3rd_Party__c, Presentation_Duration_In_Minutes__c, End_Date_Time__c FROM Workshops__r ORDER BY Start_Date_Time__c ASC), (SELECT Id, Name, QuoteNumber, Status, ContactId, Contact.Name FROM Quotes WHERE Status = 'Accepted' ORDER BY CreatedDate DESC LIMIT 1) FROM Opportunity WHERE Id IN :ids LIMIT 1];
        if(!oppList.isEmpty())
        {
            String scheduleTable = '<table style="border: 1px solid black;border-collapse: collapse;"><tr><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Program Selection</th><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Presentation Type</th><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Year Levels/Audience</th><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Numbers Attending</th><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Date</th><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Time</th><th style="border: 1px solid black;border-collapse: collapse;padding: 3px;">Presentation Duration (In Minutes)</th></tr>';
            String noOfWorkshops = '';
            String quoteNumber = '';
            String recepientName = '';
            Boolean isPaidProgramAvailable = false;
            if(!oppList[0].Workshops__r.isEmpty())
            {
                noOfWorkshops = String.valueOf(oppList[0].Workshops__r.size());
                for(Workshops__c ws : oppList[0].Workshops__r)
                {
                    scheduleTable += '<tr><td style="border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Program__c != null ? ws.Program__r.Name : ' ') + '</td><td style="border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Presentation_Type__c != null ? ws.Presentation_Type__c : ' ') + '</td><td style="border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Year_Level__c != null ? ws.Year_Level__c : ' ') + '</td><td style="text-align: center;border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Number_of_Attendees__c != null ? ws.Number_of_Attendees__c : 0) + '</td><td style="border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Start_Date_Time__c != null ? ws.Start_Date_Time__c.date().format() : ' ') + '</td><td style="border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Start_Date_Time__c != null ? ws.Start_Date_Time__c.format('h:mm a') : ' ') + '</td><td style="text-align: center;border: 1px solid black;border-collapse: collapse;padding: 3px;">' + (ws.Presentation_Duration_In_Minutes__c != null ? ws.Presentation_Duration_In_Minutes__c : ' ') + '</td></tr>';
                    if(ws.Funded_by_3rd_Party__c == null)
                    {
                        isPaidProgramAvailable = true;
                    }
                }
                scheduleTable += '</table>';
            }
            String toWhomInvoiceSentTo;
            if(isPaidProgramAvailable)
            {
                toWhomInvoiceSentTo = oppList[0].To_whom_shall_the_invoice_be_sent_to__c != null ? oppList[0].To_whom_shall_the_invoice_be_sent_to__r.Name + ', ' + oppList[0].To_whom_shall_the_invoice_be_sent_to__r.Email : '';
            }
            else 
            {
                toWhomInvoiceSentTo = 'Not Applicable';
            }
            Id targetObjectId;
            if(!oppList[0].Quotes.isEmpty())
            {
                quoteNumber = oppList[0].Quotes[0].QuoteNumber;
                targetObjectId = oppList[0].Quotes[0].ContactId;
                recepientName = oppList[0].Quotes[0].ContactId != null ? oppList[0].Quotes[0].Contact.Name : '';
            }
            List<EmailTemplate> templateList = [SELECT Id, Subject, HtmlValue FROM EmailTemplate WHERE DeveloperName = 'Confirmation_Letter_Of_The_Booking_1737966946724' LIMIT 1];
            String sendersEmail = System.label.Sender_s_Email_Address; 
            List<OrgWideEmailAddress> oweaList = [SELECT Id FROM OrgWideEmailAddress WHERE Address = :sendersEmail];
            List<Messaging.SingleEmailMessage> allmsg = new List<Messaging.SingleEmailMessage>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            if(!templateList.isEmpty())
            {
                String htmlbody = templateList[0].HtmlValue;
                htmlbody = htmlbody.replace('{{{Recipient.Name}}}', recepientName);
                htmlbody = htmlbody.replace('{{{PresentationCount}}}', noOfWorkshops);
                htmlbody = htmlbody.replace('{{{QuoteNumber}}}', quoteNumber);
                htmlbody = htmlbody.replace('{{{ScheduleTable}}}', scheduleTable);
                htmlbody = htmlbody.replace('{{{To_whom_shall_the_invoice_be_sent_to__c}}}', toWhomInvoiceSentTo);
                htmlbody = htmlbody.replace('{{{Opportunity.Will_you_be_the_main_contact_throughout__c}}}', oppList[0].Will_you_be_the_main_contact_throughout__c != null ? oppList[0].Will_you_be_the_main_contact_throughout__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Who_will_meet_presenter_at_reception__c}}}', oppList[0].Who_will_meet_presenter_at_reception__c != null ? oppList[0].Who_will_meet_presenter_at_reception__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Anything_of_sensitivity__c}}}', oppList[0].Anything_of_sensitivity__c != null ? oppList[0].Anything_of_sensitivity__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Student_numbers_for_each_session__c}}}', oppList[0].Student_numbers_for_each_session__c != null ? oppList[0].Student_numbers_for_each_session__c : '');
                if(isPaidProgramAvailable)
                {
                    htmlbody = htmlbody.replace('{{{Opportunity.Will_you_raise_a_PO_for_this_booking__c}}}', oppList[0].Will_you_raise_a_PO_for_this_booking__c == true ? 'Yes' : 'No');
                    htmlbody = htmlbody.replace('{{{Opportunity.Purchase_Order_Number__c}}}', oppList[0].Purchase_Order_Number__c != null ? (', ' + oppList[0].Purchase_Order_Number__c) : '');    
                }
                else 
                {
                    htmlbody = htmlbody.replace('{{{Opportunity.Will_you_raise_a_PO_for_this_booking__c}}}', 'Not Applicable');
                    htmlbody = htmlbody.replace('{{{Opportunity.Purchase_Order_Number__c}}}', '');    
                }
                htmlbody = htmlbody.replace('{{{Opportunity.Where_will_the_program_be_held__c}}}', oppList[0].Where_will_the_program_be_held__c != null ? oppList[0].Where_will_the_program_be_held__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.other_Location__c}}}', oppList[0].other_Location__c != null ? (', ' + oppList[0].other_Location__c) : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Do_you_have_audio_visual_equipment__c}}}', oppList[0].Do_you_have_audio_visual_equipment__c != null ? oppList[0].Do_you_have_audio_visual_equipment__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Can_you_have_an_IT_member_available__c}}}', oppList[0].Can_you_have_an_IT_member_available__c != null ? oppList[0].Can_you_have_an_IT_member_available__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Person_allocated_for_tech_support__c}}}', oppList[0].Person_allocated_for_tech_support__c != null ? oppList[0].Person_allocated_for_tech_support__c : '');
                htmlbody = htmlbody.replace('{{{Opportunity.Where_can_the_presenter_park__c}}}', oppList[0].Where_can_the_presenter_park__c != null ? oppList[0].Where_can_the_presenter_park__c : '');
                mail.setTemplateId(templateList[0].Id);
                mail.setHtmlBody(htmlbody);
                mail.setSubject(templateList[0].Subject);
                mail.setTargetObjectId(targetObjectId);
                mail.setSaveAsActivity(true);
                if (!oweaList.isEmpty()) 
                {
                    mail.setOrgWideEmailAddressId(oweaList[0].Id);        
                }
                mail.setWhatId(oppList[0].Id);
                System.debug('mail => ' + mail);
                allmsg.add(mail);
                try 
                {
                    Messaging.SendEmailResult[] results = Messaging.sendEmail(allmsg, false);    
                } 
                catch(Exception e) 
                {
                    System.debug('Exception type caught: ' + e.getTypeName());
                    System.debug('Exception message: ' + e.getMessage());     
                }
            }
        }
    }
}