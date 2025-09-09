/*
Created By          : Girikon (Sahil)
Created On          : Jan 09, 2025
@description        : This class is a outer class for an InvocableMethod used in a flow to create calender events for facilitators.
Test Class          : CreateEventsForFacilitators_Test (Coverage: __%)

Modification log --
Modified By         : Girikon
Modified On         : May 20, 2025
@description        : added opportunity role query from opportunity and added the contact details in the description
*/
public with sharing class CreateEventsForFacilitators 
{
    @InvocableMethod(label='Create Events For Facilitators' description='Create calender events for facilitators available on workshop records under opportunity.')
    public static List<String> createEvents(List<Id> ids) 
    {
        List<Event> existingEvents = [SELECT Id FROM Event WHERE Created_For_Facilitator__c = true AND WhatId IN :ids];
        if(!existingEvents.isEmpty())
        {
            return new List<String>{'Events are already created for this Opportunity. In order to create again, please delete the existing ones first.'};
        }
        List<Opportunity> oppList = [SELECT Id, Name, Will_you_be_the_main_contact_throughout__c, Who_will_meet_presenter_at_reception__c, Anything_of_sensitivity__c, Student_numbers_for_each_session__c, Can_you_have_an_IT_member_available__c, Person_allocated_for_tech_support__c, Where_can_the_presenter_park__c, Where_will_the_program_be_held__c, other_Location__c, Presentation_Location__c, Presentation_Location__Street__s, Presentation_Location__City__s, Presentation_Location__StateCode__s, toLabel(Presentation_Location__CountryCode__s), Presentation_Location__PostalCode__s, AccountId, Account.Name, Do_you_have_audio_visual_equipment__c, (SELECT Id, Name, Number_of_Attendees__c, Presenter__c, Presenter__r.Name, Program__c, Program__r.Name, Program_Type__c, Start_Date_Time__c, Year_Level__c , Presentation_Type__c, Organisation__c, Organisation__r.Name, Presentation_Duration_In_Minutes__c, End_Date_Time__c FROM Workshops__r ORDER BY Start_Date_Time__c ASC),(SELECT Id,contact.email,contact.phone,contact.Name FROM OpportunityContactRoles WHERE IsPrimary = true) FROM Opportunity WHERE Id IN :ids LIMIT 1];
        if(!oppList[0].Workshops__r.isEmpty())
        {
            Boolean presenterFlag = false;
            Boolean startDateFlag = false;
            Map<Date, List<Workshops__c>> dateAndWorkshopsMap = new Map<Date, List<Workshops__c>>();
            Map<Date, Set<Id>> dateAndPresenterMap = new Map<Date, Set<Id>>();
            for(Workshops__c ws : oppList[0].Workshops__r)
            {
                if(ws.Presenter__c == null)
                {
                    presenterFlag = true;
                    break;
                }
                else if(ws.Start_Date_Time__c == null) 
                {
                    startDateFlag = true;
                    break;
                }
                else
                {
                    Date eventDate = ws.Start_Date_Time__c.date();
                    if(dateAndWorkshopsMap.containsKey(eventDate))
                    {
                        List<Workshops__c> tempWSList = dateAndWorkshopsMap.get(eventDate);
                        tempWSList.add(ws);
                        dateAndWorkshopsMap.put(eventDate, tempWSList);
                        Set<Id> tempIdSet = dateAndPresenterMap.get(eventDate);
                        tempIdSet.add(ws.Presenter__c);
                        dateAndPresenterMap.put(eventDate, tempIdSet);
                    }
                    else
                    {
                        dateAndWorkshopsMap.put(eventDate, new List<Workshops__c>{ws});
                        dateAndPresenterMap.put(eventDate, new Set<Id>{ws.Presenter__c});
                    }
                }
            }
            if(presenterFlag)
            {
                return new List<String>{'Please populate a value first in \'Presenter\' field for every Workshop record available under this Opportunity.'};
            }
            if(startDateFlag)
            {
                return new List<String>{'Please populate a value first in \'Start Date & Time\' field for every Workshop record available under this Opportunity.'};
            }
            String bzSchoolEmail = System.label.Bully_Zero_School_Outlook_Calender_Email;
            List<User> bzSchoolUser = [SELECT Id FROM User WHERE Email = :bzSchoolEmail LIMIT 1];
            List<Event> evtList = new List<Event>();
            Map<String, Schema.SObjectField> oppFieldsMap = Schema.Opportunity.SObjectType.getDescribe().fields.getMap();
            Map<String, Schema.SObjectField> wsFieldsMap = Schema.Workshops__c.SObjectType.getDescribe().fields.getMap();
            for(Date dt : dateAndWorkshopsMap.keySet())
            {
                Event evt = new Event();
                evt.Presentation_State__c = oppList[0].Presentation_Location__StateCode__s;
                evt.StartDateTime = dateAndWorkshopsMap.get(dt)[0].Start_Date_Time__c;
                evt.EndDateTime = dateAndWorkshopsMap.get(dt)[dateAndWorkshopsMap.get(dt).size() - 1].End_Date_Time__c; //Start_Date_Time__c.addHours(1);
                evt.WhatId = oppList[0].Id;
                evt.WhoId = dateAndWorkshopsMap.get(dt)[0].Presenter__c;
                evt.Created_For_Facilitator__c = true;
                String subject = oppList[0].Account.Name;
                String description = 'School/Organisation Name - ' + oppList[0].Account.Name + '\r\n';
                if( !oppList[0].OpportunityContactRoles.isEmpty() && oppList[0].OpportunityContactRoles != null ){
                    description += oppList[0].OpportunityContactRoles[0].Contact.Name == null ? '' : 'Contact Name - ' + oppList[0].OpportunityContactRoles[0].Contact.Name + '\r\n';
                    description +=  oppList[0].OpportunityContactRoles[0].Contact.Phone == null ? '' : 'Contact Phone - ' + oppList[0].OpportunityContactRoles[0].Contact.Phone + '\r\n';
                    
                }
                description +=  '\r\n';
                
                for(Workshops__c ws : dateAndWorkshopsMap.get(dt))
                {
                    // subject = subject + ws.Program__r.Name + ', ';
                    description += wsFieldsMap.get('Presenter__c').getDescribe().getLabel() + ' - ' + ws.Presenter__r.Name + '\r\n';
                    description += 'Program Name - ' + (ws.Program__c == null ? '' : ws.Program__r.Name) + '\r\n';
                    description += wsFieldsMap.get('Program_Type__c').getDescribe().getLabel() + ' - ' + (ws.Program_Type__c == null ? '' : ws.Program_Type__c) + '\r\n';
                    description += wsFieldsMap.get('Presentation_Type__c').getDescribe().getLabel() + ' - ' + (ws.Presentation_Type__c == null ? '' : ws.Presentation_Type__c) + '\r\n';
                    description += wsFieldsMap.get('Year_Level__c').getDescribe().getLabel() + ' - ' + (ws.Year_Level__c == null ? '' : ws.Year_Level__c) + '\r\n';
                    if(ws.Number_of_Attendees__c == null)
                    {
                        description += wsFieldsMap.get('Number_of_Attendees__c').getDescribe().getLabel() + ' - ' + '\r\n';
                    }
                    else 
                    {
                        description += wsFieldsMap.get('Number_of_Attendees__c').getDescribe().getLabel() + ' - ' + ws.Number_of_Attendees__c + '\r\n';
                    }
                    description += wsFieldsMap.get('Start_Date_Time__c').getDescribe().getLabel() + ' - ' + ws.Start_Date_Time__c.format() + '\r\n';
                    description += wsFieldsMap.get('Presentation_Duration_In_Minutes__c').getDescribe().getLabel() + ' - ' + (ws.Presentation_Duration_In_Minutes__c == null ? '' : ws.Presentation_Duration_In_Minutes__c) + '\r\n\r\n';
                }
                // description += '\r\n';
                description += oppFieldsMap.get('Will_you_be_the_main_contact_throughout__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Will_you_be_the_main_contact_throughout__c == null ? '' : oppList[0].Will_you_be_the_main_contact_throughout__c) + '\r\n';
                description += oppFieldsMap.get('Who_will_meet_presenter_at_reception__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Who_will_meet_presenter_at_reception__c == null ? '' : oppList[0].Who_will_meet_presenter_at_reception__c) + '\r\n';
                description += oppFieldsMap.get('Anything_of_sensitivity__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Anything_of_sensitivity__c == null ? '' : oppList[0].Anything_of_sensitivity__c) + '\r\n';
                description += oppFieldsMap.get('Student_numbers_for_each_session__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Student_numbers_for_each_session__c == null ? '' : oppList[0].Student_numbers_for_each_session__c) + '\r\n';
                description += oppFieldsMap.get('Can_you_have_an_IT_member_available__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Can_you_have_an_IT_member_available__c == null ? '' : oppList[0].Can_you_have_an_IT_member_available__c) + '\r\n';
                description += oppFieldsMap.get('Person_allocated_for_tech_support__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Person_allocated_for_tech_support__c == null ? '' : oppList[0].Person_allocated_for_tech_support__c) + '\r\n';
                description += oppFieldsMap.get('Where_can_the_presenter_park__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Where_can_the_presenter_park__c == null ? '' : oppList[0].Where_can_the_presenter_park__c) + '\r\n';
                description += oppFieldsMap.get('Where_will_the_program_be_held__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Where_will_the_program_be_held__c == null ? '' : oppList[0].Where_will_the_program_be_held__c) + '\r\n';
                if(oppList[0].Where_will_the_program_be_held__c == 'Other Location')
                {
                    description += oppFieldsMap.get('other_Location__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].other_Location__c == null ? '' : oppList[0].other_Location__c) + '\r\n';
                }
                description += oppFieldsMap.get('Do_you_have_audio_visual_equipment__c').getDescribe().getInlineHelpText() + ' - ' + (oppList[0].Do_you_have_audio_visual_equipment__c == null ? '' : oppList[0].Do_you_have_audio_visual_equipment__c) + '\r\n';
                description += '\r\n';
                description += oppFieldsMap.get('Presentation_Location__c').getDescribe().getLabel() + ' - ' + oppList[0].Presentation_Location__Street__s + ' ' + oppList[0].Presentation_Location__City__s + ' ' + oppList[0].Presentation_Location__StateCode__s + ' ' + oppList[0].Presentation_Location__CountryCode__s + ' ' + oppList[0].Presentation_Location__PostalCode__s;
                evt.Description = description;
                // subject = subject.removeEnd(', ');
                evt.Subject = subject;
                evt.OwnerId = bzSchoolUser[0].Id;
                evtList.add(evt);
            }
            if(!evtList.isEmpty())
            {
                INSERT evtList;
            }
            // List<Contact> bzSchoolContact = [SELECT Id FROM Contact WHERE Email = :bzSchoolEmail LIMIT 1];
            List<EventRelation> erList = new List<EventRelation>();
            for(Event e : evtList)
            {
                Date dt = e.StartDateTime.date();
                for(Id presenterId : dateAndPresenterMap.get(dt))
                {
                    EventRelation er = new EventRelation();
                    er.EventId = e.Id;
                    er.RelationId = presenterId;
                    erList.add(er);
                }
                // if(!bzSchoolContact.isEmpty())
                // {
                //     EventRelation er = new EventRelation();
                //     er.EventId = e.Id;
                //     er.RelationId = bzSchoolContact[0].Id;
                //     erList.add(er);
                // }
            }
            if(!erList.isEmpty())
            {
                INSERT erList;
            }
        }
        else 
        {
            return new List<String>{'There are no Workshop records available for this Opportunity.'};
        }
        return new List<String>{'Calender Events are created for the facilitators for the Workshops available under this Opportunity.'};
    }
}