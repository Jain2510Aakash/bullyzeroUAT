({
    init: function (component) {
        var isParamFound = false;
        var id = '';
        var filledByBullyZero = false;
        var isFunded = false;
        // Get the lead id from the window url
        var url = window.location.href;
        var urlArray = url.split('?');
        if (urlArray.length > 1) {
            var paramsArray = urlArray[1].split('&');
            if (paramsArray.length > 0) {
                paramsArray.forEach(item => {
                    if (item.startsWith('Id=')) {
                        isParamFound = true;
                        id = item.split('=')[1];
                    }
                    else if (item.startsWith('FilledByBullyZero=')) {
                        isParamFound = true;
                        filledByBullyZero = item.split('=')[1];
                    }
                    else if (item.startsWith('IsFunded=')) {
                        isParamFound = true;
                        isFunded = item.split('=')[1];
                    }
                });
            }
        }
        // console.log('isParamFound => ', isParamFound);
        // console.log('id => ', id);
        // Find the component whose aura:id is "flowData"
        var flow = component.find("flowData");
        // In that component, start your flow. Reference the flow's API Name
        if (isParamFound) {
            var inputVariables = [
                {
                    name: 'leadId',
                    type: 'String',
                    value: id
                },
                {
                    name: 'filledByBullyZero',
                    type: 'Boolean',
                    value: filledByBullyZero
                },
                {
                    name: 'isFunded',
                    type: 'Boolean',
                    value: isFunded
                }
            ];
            flow.startFlow("Booking_Form", inputVariables);
        }
        else {
            flow.startFlow("Booking_Form");
        }
    }
})