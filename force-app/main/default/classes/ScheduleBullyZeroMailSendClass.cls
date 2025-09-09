/*
Created By          : Girikon (Aman Mahto)
Created On          : Dec 24, 2024
@description        : This class is for scheduling the BullyZeroPartBAutomateMailBatchClass.
Test Class          : 
 
Modification log --
Modified By         :
Modified On         :
@description        :
*/

public class ScheduleBullyZeroMailSendClass implements Schedulable {
    public void execute(SchedulableContext ctx) {
        
        BullyZeroPartBAutomateMailBAtchClass bu = new BullyZeroPartBAutomateMailBAtchClass();
        
        Id batchId = Database.executeBatch(bu);
    }
}