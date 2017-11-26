$(document).ready(function() {
    $('.modal').modal();
    // Get the modal: Contact
    var modalContact = document.getElementById('contact');
    var gform = document.getElementById('gform');
    var thanks_msg = document.getElementById('thankyou_message');

    var loading = document.getElementById('sendLoader');

    // Get the button that opens the modal
    var btnContact = document.getElementById("contactBtn");

    // When the user clicks the button, open the modal
    btnContact.onclick = function() {
        modalContact.style.display = 'block';
        gform.style.display = 'block';
        thanks_msg.style.display = 'none';
        document.getElementById("gform").reset();
    }

    $("#sendBtn").click(function() {
        $("#sendBtn").hide();
        $("#loader-wrapper").show();
            setTimeout(function() {
                
                // For failed icon just replace ".done" with ".failed"
                $(".done").addClass("finish");
            }, 3000);
            setTimeout(function() {
                $("#sendBtn").show();
                $("#loader-wrapper").hide();
                $(".done").removeClass("finish");
                $(".failed").removeClass("finish");
            }, 5000);
        
      })

  });