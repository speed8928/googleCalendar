$(function() {
    //Read ajax from server
    $('#get-button').on('click', function() {
        
        $.ajax({
            url: '/obj',
            contentType: 'application/json',
            dataType: "json",
            success: function(response) {
                var tbodyEl = $('tbody');
                
                tbodyEl.html('');
                
               $.each(response, function(index, item) {

                        tbodyEl.append('\
                            <tr>\
                                <td class="cre_Time">' + item.created + '</td>\
                                <td class="name"> '+ item.summary + '</td>\
                                <td><input type="button" class="BreakDown" id="flip" value="Break item down"><br>\
                                    <div id="panel"> <p align="left">Event:</p> <input type="text" class="Event_name" value= "' + item.summary + '" ><br>\
                                                     <p align="left">Location:</p> <input type="text" class="Update_location" value= "' + item.location + '" ><br>\
                                    <p align="left"> Description:</p>\
                                                    <textarea cols="40" rows="10" class="Update_description">' + item.description + '</textarea><br>\
                                    Start:'+ item.start.dateTime +'<br>End: :'+ item.end.dateTime +'<br>\
                                        <button class="update-button">UPDATE</button>\
                                    </div>\
                                <td><button class="delete-button">DELETE</button></td>\
                                <td class="ID">'+ item.id +'</td>\
                            </tr>\
                        ');
                });
            }
        });
    });

     $('table').on('click','.BreakDown',function(){
                  var ft = $(this).closest('td');
                  ft.find('#panel').toggle();
                });

//Post a new item through ajax
   
     $('#create-new').on('click', function(event) {
        event.preventDefault();
        var createInput = $('#create-input');  
        var descriptionContent = $('#description-content');
        var location = $('#location');
        var createdTime = new Date().toJSON();
      
        var end = document.getElementById("endTime");
        var start = document.getElementById("startTime");
       
       

       
           
        $.ajax({
            url: '/obj',
            method: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: JSON.stringify({ summary: createInput.val(), location: location.val() , created: createdTime 
            ,description: descriptionContent.val(), start:{dateTime:start.value+':00+08:00'} ,end:{dateTime:end.value+':00+08:00'}}),
            success: function(response) {
                console.log(response);

            }
        });
                alert("send");
                createInput.val('');
                start.value ='';
                descriptionContent.val('');
                end.value ='';
                location.val('');     
                $('#get-button').click();
    });

//Delete item
        $('table').on('click', '.delete-button', function() {
        var rowEl = $(this).closest('tr');
        var id = rowEl.find('.ID').text();

        $.ajax({
            url: '/obj/' + id,
            method: 'DELETE',
            dataType: "json",
            contentType: 'application/json',
            success: function(response) {
                console.log(response);  
            } 
        });
        $('#get-button').click();
    });

//Update item
     $('table').on('click', '.update-button', function() {

        var rowEl = $(this).closest('tr');
        var id = rowEl.find('.ID').text();

        var ElementFinder = $(this).closest('div');
        var newEvent = ElementFinder.find('.Event_name').val();
        var newLocation = ElementFinder.find('.Update_location').val();
        var newDescription = ElementFinder.find('.Update_description').val();
        var createdTime = new Date().toJSON();
        var start = '2017-06-01T12:45:00+08:00';
        var end = '2017-06-01T12:46:00+08:00';
        $.ajax({
            url: '/obj/' + id,
            method: 'PUT',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({ summary: newEvent, location: newLocation, description: newDescription}),
            success: function(response) {
                console.log(response);
                alert('successfully updated');
            } 
        });
        $('#get-button').click();
        
    });




});
