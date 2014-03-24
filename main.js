$(function() {
  $("#select-track").submit(function(e){
    var formObj = $(this);
    var formURL = formObj.attr("action");
    var formData = new FormData(this);
    $.ajax({
        url: formURL,
    	type: 'POST',
    	dataType :'json',
        data:  formData,
    	mimeType:"multipart/form-data",
    	contentType: false,
        cache: false,
        processData:false,
    	success: function(data)
    	{
 			//$("#result").append(data);
 			$("#track-id").text(data.response.track.id);
    	}       
    });
    e.preventDefault(); //Prevent Default action. 
  });

  $("#reload").click(function(){
  	var trackID = $("#track-id").text();
  	console.log("reload : " + trackID);
  	$.ajax({
  		url: "http://developer.echonest.com/api/v4/track/profile",
  		data:{
  			"api_key":"5I0JUWBNOFNGL33PZ",
  			"id":trackID,
  			"bucket":"audio_summary"
  		},
  		dataType:'json',
  		success:function(data){
  			alert(JSON.stringify(data));
  		}
  	});
  });
});