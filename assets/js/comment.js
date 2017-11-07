$(function () {
    firebase.initializeApp({
        databaseURL: "https://a-delacruz.firebaseio.com"
    });

    var rootRef = firebase.database().ref();
    var postComments = rootRef.child('postComments');

    var link = $("link[rel='canonical']").attr("href");
    var pathkey = decodeURI(link.replace(new RegExp('\\/|\\.', 'g'),"_"));
    var postRef = postComments.child(pathkey);

        $("#comment").submit(function() {
            if ($('#message').val().trim().length > 0 && $('#name').val().trim().length > 0) {
                postRef.push().set({
                    name: $("#name").val(),
                    message: $("#message").val(),
                    md5Email: md5($("#email").val()),
                    postedAt: firebase.database.ServerValue.TIMESTAMP
                })
            };

            $("input[type=text], textarea").val("");
            return false;
        });
         

        postRef.on("child_added", function(snapshot) {
            var newComment = snapshot.val();

            var html = "<div class='comment'>";
            html += "<span class='user-name'>" + newComment.name + "</span>";
            html += "<div class='profile-image'><img src='https://www.gravatar.com/avatar/" + newComment.md5Email + "?s=100&d=retro'/></div>";
            html += "<span class='date'>" + moment(newComment.postedAt).fromNow() + "</span>"
            html += "<p>" + newComment.message  + "</p></div>";

            
            // html += "<a href='javascript:void(0);' id='mpopupLink' >reply</a>";
            html += "<div id='mpopupBox' class='mpopup'>";
            
            html += "<div class='mpopup-content'>";
            html += "    <div class='mpopup-head'>";
            html += "        <span class='close'>×</span>";
            html += "        <h2>Simple Modal Popup</h2>";
            html += "    </div>";
            html += "    <div class='mpopup-main'>";
            html += "        <form id='commentR'>";
            html += "<ul>";
            html += "  <li>";
            html += "    <h3>Leave a comment</h3>";
            html += "  </li>";
            html += "  <li>";
            html += "      <input type='text' id='nameR' class='field-style field-split align-left' placeholder='Name' />";
            html += "      <input type='text' id='emailR' class='field-style field-split align-right' placeholder='Email' />";
            html += "  </li>";
            html += "  <li>";
            html += "    <textarea id='messageR' class='field-style' placeholder='Message'></textarea>";
            html += "  </li>";
            html += "  <li>";
            html += "    <input id='postBtn' type='submit' value='Post Comment' />";
            html += "  </li>";
            html += "</ul>";
            html += "</form>";
            html += "    </div>";
            html += "</div>";
            html += "</div>";
            

            $(".comments").prepend(html);

            var mpopup = document.getElementById('mpopupBox');
            
            // get the link that opens the mPopup
            var mpLink = document.getElementById("mpopupLink");
            
            // get the close action element
            var close = document.getElementsByClassName("close")[0];
            
            // open the mPopup once the link is clicked
            mpLink.onclick = function() {
                mpopup.style.display = "block";
            }
            
            // close the mPopup once close element is clicked
            close.onclick = function() {
                mpopup.style.display = "none";
            }
            
            // close the mPopup when user clicks outside of the box
            window.onclick = function(event) {
                if (event.target == mpopup) {
                    mpopup.style.display = "none";
                }
            } 
            
            // Permission denied set write rule to true to make it work
            $("#commentR").submit(function() {
                firebase.database().ref('postComments/' + pathkey + '/' + testing + '/reply').push().set({
                    name: $("#nameR").val()
                })
            });
        });
      

});
