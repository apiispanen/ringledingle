
let codeLoaded = false;

function loadCode() {
  if (codeLoaded) {
    console.log("Code has already been loaded");
    return;
  }

var recipient_email = ''


$(document).ready(function() {

  // if email is undefined, get email from the args
  // var email = document.getElementById("email").innerText;
  if (typeof email === 'undefined')    {
    var urlParams = new URLSearchParams(window.location.search);
    email = urlParams.get('email');
    if (email == null) {
    email = "apiispanen@berkeley.edu";
    } 
    
    // if #email is present, put the email in the box
    
    title = urlParams.get('title');
    document.getElementById("share-email").value = recipient_email;

    console.log("EMAIL", email);
  }

  reloadMusic(email);

  // **********************************************
  // DEFAULTS
  // **********************************************

  ask_question_running = false;
  console.log("RINGLE DINGLE");
  var singer = "alan-rickman";
  var audio = null;
  var singer_name = "Alan Rickman";
  var input_file = "magic.mp3";
  var progressBar = $('.progress-bar');
  $('.carousel').carousel();
  var totalSteps = $('.carousel-inner .carousel-item').length - 2; // -2 to exclude the "Generating" and "100%" steps
  var currentStep = $('.carousel-inner .carousel-item.active').index();
 

  async function generateLyrics() {
    console.log("Generating Lyrics...");

    
// **********************************************
// GENERATE LYRICS
// **********************************************


  if(ask_question_running){
    console.log("Ringle Dingle is already running");
    showMessageModal("Ringle Dingle is already running");
    return Promise.reject(new Error("Ringle Dingle is already running"));
  }
  ask_question_running = true;

  // get the text from the about box and escape it
  var about = document.getElementById("about").value;
  var email = document.getElementById("email").value;

  console.log("ABOUT", about, "EMAIL", email);
  var ai_request = "Generate a 4 stanza poem that will be narrated by ".concat(singer_name).concat(". Your poem MUST be in between the deliminiters STARTPOEM and ENDPOEM (respond with poem text ONLY, no 'Verse 1:' labels either).\n Also, the poem title will be between delimiters STARTTITLE and ENDTITLE.\nMake this poem from the following:\n").concat(about);
  // ringlelyrics.textContent = 'Words are gathering, it may take a couple minutes...';

  console.log(ai_request);
  try {
    const response = await fetch('/generate-lyrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        words: ai_request,
        singer_name: singer_name,
        email: email
      })
    });

    const data = await response.json();
  
  
    // document.getElementById('lyric-spinner').style.display = 'none';
    console.log(data);
    var lyrics = data.lyrics;
    var title = data.title;
    document.getElementById("title").innerHTML = title;

    var lyrics_box = document.getElementById("edit-lyrics");
    lyrics_box.innerHTML = lyrics;

  // Hide the spinner
  $('.spinner').hide();

    
  console.log(lyrics);
  $('.carousel').carousel('next');


  // display #results
  ask_question_running = false;
  return { lyrics: data.lyrics, title: data.title, img_url: data.img_url };

  } catch (error) {

    console.error(error);
    // Hide the spinner
    $('#lyric-spinner').hide();
    // THROW THE ERROR MODAL
    // submitText.textContent = 'Error in the request. Please try again or refresh the page.';
    showMessageModal("Error in the request. Please try again or refresh the page.");
    ask_question_running = false;
    $('.carousel').carousel('prev');

    throw error;
  }


  }

  async function generateDingle(lyrics, title, singer, input_file, recipient_email, cc_email, singer_name) {
    
  console.log("Generating Dingle...", recipient_email, cc_email, singer_name);
      
  // **********************************************
  // GENERATE AUDIO
  // **********************************************
  

  // document.getElementById('spinner').style.display = 'inline-block';
  // submitText.textContent = 'Audio is generating, it may take a couple minutes...';
  if(ask_question_running){
    console.log("Ringle Dingle is already running");
    return Promise.reject(new Error("Ringle Dingle is already running"));
  }
  
  if (audio && !audio.paused) {
    audio.pause();
  }
  ask_question_running = true;


  // GET THE INPUTS
  
  console.log("Sending Narration request for a reading to voice: ".concat(singer_name));

  // HANDLE THE REQUEST
  try {
    const response = await fetch('/generate-dingle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        words: lyrics,
        title: title,
        voice: singer,
        input_file: input_file,
        recipient_email: recipient_email,
        cc_email: cc_email,
        singer_name:singer_name      })
    });
   
    const data = await response.json();
    const airesponse = data.airesponse;
    var title = data.title;
    // var img_url = data.img_url;
    // var lrc_lyrics = data.lrc_lyrics;

    ask_question_running = false;

    
    // CHANGE THE ON PAGE ELEMENTS - TITLE, IMAGE, AUDIO
    // document.getElementById("final-title").innerHTML = "Title: ".concat(title);
    // document.getElementById("final-lyrics").innerHTML = "Title: ".concat(title);
    // document.getElementById("final-image").src = img_url;
    // document.getElementById("myAudio").innerHTML = document.getElementById("myAudio").innerHTML;

    // // CHANGE THE PLAY BUTTON
    // const playButton = document.getElementById("play");
    // playButton.innerHTML = "Play Audio";
    // playButton.style.backgroundColor = "rgba(0, 128, 0, 0.3)"; // Set the background color to a light green

    reloadMusic(cc_email);
    // SUCCESS!
    // document.getElementById('.spinner').style.display = 'none';
    console.log(airesponse);
    // submitText.textContent = 'Click to Regenerate Audio';
    // next carousel
    $('.carousel').carousel('next');
    // showMessageModal(`Success! Your audio has been generated. Please go to /music?email=${decodeURIComponent(recipient_email)} to listen.`, false);

} catch (error) {
    console.error(error);
    ask_question_running = false;
    // Hide the spinner
    // document.getElementById('spinner').style.display = 'none';
    // submitText.textContent = 'Error in the request. Please try again or refresh the page.'; 
    showMessageModal('An error occurred: ' + error.message);
    $('.carousel').carousel('prev');
    throw error;
  }

  }
  
  $('.email').keypress(function(e) {
      if (e.which == 13) { // Enter key pressed
          e.preventDefault();
          $('.carousel').carousel('next');
      }
  });
  $('textarea').keypress(function(e) {
    if (e.which == 27) {
      // Get the currently focused element
      var activeElement = document.activeElement;
      activeElement.blur();
      }


      if (e.which == 13) { // Enter key pressed
          e.preventDefault();
          $('.carousel').carousel('next');
      }
  });

 
  $('.carousel').off('slid.bs.carousel').on('slid.bs.carousel', function() {
    progressBar = $('.progress-bar');
    totalSteps = $('.carousel-inner .carousel-item').length - 2; // -2 to exclude the "Generating" and "100%" steps
    currentStep = $('.carousel-inner .carousel-item.active').index();  
    console.log("ASSIGNED CURRENT STEP", currentStep);
    

    if (currentStep <= totalSteps) {
        var progressValue = ((currentStep +1) / (totalSteps+1)) * 100;
        progressBar.css('width', progressValue + '%');
        progressBar.attr('aria-valuenow', progressValue);
        progressBar.html("Step " + (currentStep + 1) + " of " + (totalSteps + 1) + "");
        // progressBar.html(Math.round(progressValue) + '%');
    } else {
        progressBar.css('width', '100%');
        progressBar.attr('aria-valuenow', 100);
        progressBar.html('100%');
    }

    // Log "fourth element" when the fourth carousel item is passed
    if (currentStep == 1) {
      console.log("FIRST STEP");
    var cc_email = document.getElementById("email").value.trim();
    // var recipient_email = document.getElementById("recipient-email").value.trim();
      // EMAIL VALIDATION
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ( !emailRegex.test(cc_email)) {
      showMessageModal('Please enter valid email addresses.');
      $('.carousel').carousel('prev');
      return; // Exit the function if the email is not valid
    } else{
      // animate the back-button entrance NO SLIDE TOGGLE:
      $('.back-button').show({
        opacity: 1,
        left: "0",
        height: "toggle"
      }, 500, function() {});
 
    }

    }
  
    if (currentStep == 4 || currentStep == 6 || currentStep == 7) {
      $('.forward-button').hide({
        opacity: 0,
        left: "0",
        height: "toggle"
      }, 500, function() {});
    } else {
      // animate the forward-button entrance NO SLIDE TOGGLE:
      $('.forward-button').show({
        opacity: 1,
        left: "0",
        height: "toggle"
      }, 500, function() {});
    }

    if (currentStep == 4) {
      generateLyrics();
    }
    
    if (currentStep == 6) {
      $('.back-button').slideToggle();
      var lyrics = encodeURIComponent(document.getElementById("edit-lyrics").value);
      // var recipient_email = encodeURIComponent(document.getElementById("recipient-email").value.trim());
      var cc_email = encodeURIComponent(document.getElementById("email").value.trim());  
      var title = encodeURIComponent(document.getElementById("title").innerHTML);
      generateDingle(lyrics, title, singer, input_file, "null@null.com", cc_email, singer_name);
    }

  
  if (currentStep == 7) {
    var cc_email = document.getElementById("email").value.trim();
    // var recipient_email = document.getElementById("recipient-email").value.trim();
    console.log( "EMAIL", cc_email, "RECIPIENT EMAIL", 'null@null.com', "TITLE", title, "SINGER", singer, "INPUT FILE", input_file);
    // Go to /music?email=email&cc_email=cc_email&title=title
    window.location.href = '/music?email=' + cc_email + '&title=' + title;

    }

    $('.carousel-item.active').find('.entry-item').focus();


});

$(document).keydown(function(e) {
  // Get the currently focused element
  var activeElement = document.activeElement;

  // Check if the active element is an input or textarea
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    return;
  }

  // When you click the right arrow on the keyboard, it will go to the next step:
  switch(true) {
    case e.which == 39 && currentStep < totalSteps && currentStep != 4: // right
      $('.carousel').carousel('next');
      break;
    case e.which == 37 && currentStep > 0 && currentStep != totalSteps-1 && currentStep != 6 && currentStep != 4: // left
      $('.carousel').carousel('prev');
      break;
    default: 
      return; // exit this handler for other keys
  }
});


// if forward-button is clicked, go to next step
$('.forward-button').click(function() {
  $('.carousel').carousel('next');
});

// if back-button is clicked, go to previous step
$('.back-button').click(function() {
  $('.carousel').carousel('prev');
});




// SELECT THE MUSIC
const musicItems = document.querySelectorAll('.song-style a');
musicItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remove previous selection
    musicItems.forEach(item => {
      item.classList.remove('selected');
    });

    // Add selection to clicked item
    item.classList.add('selected');
    // Log the value of the clicked item
    input_file = item.getAttribute('value');
    $('.carousel').carousel('next');
  });
});


// SELECT THE SINGER
const singerItems = document.querySelectorAll('.singer-select a');
singerItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remove previous selection
    singerItems.forEach(item => {
      item.classList.remove('selected');
    });

    // Add selection to clicked item
    item.classList.add('selected');

    // Log the value of the clicked item
    console.log(item.getAttribute('value').concat(" ").concat(item.innerText));
    singer = item.getAttribute('value');
    singer_name = item.innerText;
    $('.carousel').carousel('next');
  });
});




// On clicking "Enter" in #share-email input, call on the /email-share endpoint:
$('.share-to-email').on('keyup', function (e) {
  e.preventDefault();

  // if #go-back is clicked, hide the .share-container
  if (e.key === 'Escape' || e.keyCode === 27) {
    document.getElementsByClassName('share-container')[0].style.display = 'none';
  };
  // Add to conditions if #btn is clicked, do the same thing as below
  // if #send-button is clicked

  if ((e.key === 'Enter' || e.keyCode === 13) && !$('#share-email').val()) {
   sendEmail();

  };
  
});

  // if #go-back is clicked, hide the .share-container
  $('#go-back').on('click', function () {
    // a Fun Animation to hide the .share-container with jquery
    $('.share-container').animate({
      opacity: 0,
      top: '-100px'
    }, 500, function () {
      document.getElementsByClassName('share-container')[0].style.display = 'none';
    }
    );
  });

    // if #go-back is clicked, hide the .share-container
    $('#share').on('click', function () {

      // a Fun Animation to hide the .share-container with jquery
      $('.share-container').animate({
        opacity: 1,
        top: '50px'
      }, 500, function () {

      document.getElementsByClassName('share-container')[0].style.display = 'block';
      }
      );

    });

    $('#regenerate').on('click', function () {
      urlParams = new URLSearchParams(window.location.search);
      // console.log("URL PARAMS", urlParams, "EMAIL", email, "RECIPIENT EMAIL", recipient_email)
      cc_email = urlParams.get('email');
      // load "/" page:
      window.location.href = '/demo?email='+cc_email;
      
    });
    
  


$('#send-button').on('click', function () {

  if (!$('#share-email').val()){
  showMessageModal("Please enter an email address.");
  } else {
    sendEmail();
  }

});



  });


  function sendEmail(){
    // Get the URL arguments for "email" and "recipient_email"
    // GET THE URL PARAMS
    urlParams = new URLSearchParams(window.location.search);
    // console.log("URL PARAMS", urlParams, "EMAIL", email, "RECIPIENT EMAIL", recipient_email)
    
    email = encodeURIComponent(urlParams.get('email'));

    recipient_email = encodeURIComponent($('#share-email').val());
    // recipient_email = encodeURIComponent(urlParams.get('recipient_email'));

    document.getElementById('email-spinner').style.display = 'inline-block';
    $('#share-email').hide();

    document.getElementById('send-button').innerText = 'Cancel';
   
    if(ask_question_running ){
      console.log("Ringle Dingle is already running");
      showMessageModal("Send cancelled");
      $('#share-email').slideToggle();
      $('#email-spinner').hide();
      document.getElementById('send-button').innerText = 'Send';
      ask_question_running = false;
      return Promise.reject(new Error("Ringle Dingle is already running"));
    }
    
    ask_question_running = true;
  
    // Encode the values
    
    const title = $('.song-name').text();
    const lyrics = $('#lyrics-content').html();
    // replace <h2> with <p> in lyrics:
    lyrics.replace('<h4>', '<br>');
    lyrics.replace('<\h4>', '');
    
    const img_url = $('#album-art').attr('src');
    singer_name =$(".artist-name").text();
    const note = $('#email-note').val();

    console.log("SENDING UP", email, recipient_email, title, lyrics, note);
    
    
    const data = {
      email: email,
      recipient_email: recipient_email,
      title: title,
      lyrics: lyrics,
      img_url: img_url,
      singer_name: singer_name,
      note: note
    };
    $.ajax({
      type: 'POST',
      url: '/email-share',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (data) {
      console.log(data);

        showMessageModal(data.success.concat(`! \n\nIf an error occurred, try resending the email, or press 'Start Over' to try to Ringle another Dingle.`), false);
        document.getElementById('send-button').innerText = 'Send Email';

        $('#email-spinner').hide();
        $('.share-container').hide();
        $('#share-email').show();
        $('#share-email').val('');
      },
      error: function (error) {
        console.log('error');
        console.log(error);
        showMessageModal('An error occurred: ' + error.message + '. Please make sure you\'ve filled out the form - if not, please refresh the page.');
        document.getElementById('send-button').innerText = 'Send Email';

        $('#share-email').show();
        $('#email-spinner').hide();
      },
    });
    

    ask_question_running = false;
    return false;

  }


  // var audio = document.getElementById("audioFile");
  // loadSong("https://storage.googleapis.com/ringledingle/cards/Demo/output.mp3");
  // fetchLrc("https://storage.googleapis.com/ringledingle/cards/Demo/output_lyrics.lrc");
  // Fetch LRC file and parse it
  // console.clear();
  $.expr[":"].contains = $.expr.createPseudo(function(arg) {
      return function( elem ) {
          return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
      };
  });
  var buttonColorOnPress = "white";

  // *****************************************
  // *****************************************
  // *****************************************
  // *****************************************
  // *****************************************
  // *****************************************

  // *****************************************
  // *****************************************
  // **********  RELOAD MUSIC  ***************
  // *****************************************
  // *****************************************

  async function reloadMusic(user_email) {
    
    // console.log("RELOADING music with email", user_email);
    $.getJSON('/get-json?email='+user_email + "&title="+title, function (playlist) {
  
    // convert playlist to array
    var songs = JSON.parse(playlist);
    // console.log("playlist", songs);
    // console.log("playlist audio", songs[0].audio);
    // print the playlist data type
    // console.log("playlist type:", typeof songs);
    var data = playlist;
    // $.getJSON('/static/playlist.json',function(data){
      var abort_other_json;
      var playlist = data;
      var index = 0;
      var indexing = songs[index];
      // console.log(indexing.audio);
      var time = 0;
      var totalTime = 0;
      var timeList = [];
      var play = 0;
      var counter = 0;
      var songRepeat = 0;
      var songShuffle = 0;
      var mute = 0;
      var stopTimer;
      var previousTime;
      var safeKill = 0;
      var songset = false;
      var audio = document.getElementById('audioFile');
      function centerize() {
          
          if(play == 0) return;        
          if($(".current").length == 0) return;
          var a = $(".current").height();
          var c = $("#lyrics").height();
          var d = $(".current").offset().top - $(".current").parent().offset().top;
          var e = d + (a/2) - (c*1/4) + 60 ;
          $("#lyrics").animate(
              {scrollTop: e + "px"}, {easing: "swing", duration: 700}
          );
      }
      function next(){
          var current = $('#lyrics .current');
          console.log("NEXT", current.length);
          if(current.length == 0){ $('#lyrics-content h4:nth-child(1)').addClass("current"); return; }
          current.removeClass('current');
          current.next().addClass('current');
      }
      function previous(){
          var current = $('#lyrics .current');
          if(current.length == 0){ return; }
          var first = $('#lyrics-content h4:nth-child(1)');
          current.removeClass('current');
          if(current === first){ return; }
          current.prev().addClass('current');
      }
      function setSongName(songName){
          var context = $('.song-name');
          for(var i=0;i<context.length;i++){
              context[i].innerHTML = songName;
              songset = true;
              console.log("SONG", songName);
          }
      }
      function setArtistName(artistName){
          var context = $('.artist-name');
          for(var i=0;i<context.length;i++){
              context[i].innerHTML = "In the style of ".concat(artistName);
          }
      }
      function setAlbumArt(albumart){
          var context = $('#album-art');
          context.attr("src",albumart);
      }
      function processTime(a){
          var b = parseInt(a/60000);
          var c = parseInt((a%60000)/1000);
          if(c < 10){ c = "0"+c; }
          return b+":"+c;
      }
      function reset(){
          time = 0;
          audio.currentTime = 0;
      }
      function playSong(){
          if(play==0){play = 1;audio.play();$('#menu button#play i').removeClass("fa-play");$('#menu button#play i').addClass("fa-pause");}
          else{play = 0;audio.pause();$('#menu button#play i').removeClass("fa-pause");$('#menu button#play i').addClass("fa-play");}
      }
      function processing(data){
          if(data.author == ""){ data.author = "Unknown"; }
          setSongName(data.title);
          // console.log(data.title);
          setArtistName(data.author);
          setAlbumArt(data.albumart);
          // console.log(data);
      var html = '';
        // console.log("DATA JSON", data.json);
      $.getJSON(data.json, function(index) {
      // Use the retrieved JSON data here
      // console.log("length of i:",index.lyrics.length);
      for (var i = 0; i < index.lyrics.length; i++) {
          timeList.push(index.lyrics[i].time);
          html += "<h4>" + index.lyrics[i].line + "</h4>";
      }
  
      $('#lyrics-content').html(html);
      $('#currentTime').html(processTime(time));
      var percent = time / totalTime * 100;
      $('#progress').css("width", percent + "%");
      })
      .fail(function() {
      // Handle the case where the JSON retrieval fails
      console.log("Error retrieving JSON data");
  
      });
      }
      $('#progress-bar').on('mousedown',function(){
          $('#progress-bar').on('mousemove',function handler(event){
            event.preventDefault;
            if(event.offsetY > 5 || event.offsetY < 1) return;
            var width = $('#progress-bar').css("width");
            var percent = parseInt(event.offsetX)/parseInt(width)*100;
            $('#progress').css("width",percent+"%");
            time = parseInt(totalTime * (percent/100));
            audio.currentTime = parseInt(time/1000);
          });
      });
   function changeProgress(){
     dragHandler = (event)=>{
            event.preventDefault;
             // if mouse isn't pushed down, do nothing
             if(!mouseDown) {console.log("MOUSED");return};
            if(event.offsetY > 5 || event.offsetY < 1) return;
            var width = $('#progress-bar').css("width");
            var percent = parseInt(event.offsetX)/parseInt(width)*100;
            $('#progress').css("width",percent+"%");
            time = parseInt(totalTime * (percent/100));
            audio.currentTime = parseInt(time/1000);
            return;
          };
      };
      $('#progressButton').on('mousedown',changeProgress());
      $('#progress-bar').mouseup(function(){
          $('#progress-bar').off('mousemove');
      });
      $('#progressButton').mouseup(function(){
          $('#progress-bar').off('mousemove');
      });
      function rewind5s(){
          if(time > 5000)
              time = time - 5000;
          else
              time = 0;
          audio.currentTime = parseInt(time/1000);
      }
      function forward5s(){
          if((time+5000) < totalTime)
              time = time + 5000;
          else
              time = totalTime;
          audio.currentTime = parseInt(time/1000);
      }
      $(document).bind('keydown',function(event){
          // Check if the active element is an input or textarea
          var activeElement = document.activeElement;

          if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            return;
          }

          switch(event.keyCode){
              case 37:
              rewind5s();
              break;
              case 39:
              forward5s();
              break;
          }
      });
      function toggleRepeat(){if(songRepeat == 0){$('#repeat').css("color",buttonColorOnPress);songRepeat=1;}else{$('#repeat').css("color","grey");songRepeat=0;}};
      function toggleShuffle(){if(songShuffle == 0){$('#shuffle').css("color",buttonColorOnPress);songShuffle = 1;}else{$('#shuffle').css("color","grey");songShuffle = 0;}};
      function toggleMute(){if(mute == 0){mute=1;audio.volume = 0;}else{mute = 0;audio.volume = 1;}}
      $(document).bind('keypress',function(event){
          //console.log(event.keyCode);
          var activeElement = document.activeElement;

          if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            return;
          }
    
          
          switch(event.keyCode){
      
              case 32:
              playSong();
              break;
              case 109:
              toggleMute();
              break;
              case 114:
              toggleRepeat();
              break;
              case 115:
              toggleShuffle();
              break;
          }
      });
      function prevSong(){
          if(abort_other_json){abort_other_json.abort();}reset();timeList=[];previousTime=0;counter=0;
          clearInterval(stopTimer);
          index = (index-1)%songs.length;
          indexing = songs[index];
          $('#audioFile').attr('src',indexing.audio);
          loadSong();
      }
      function nextSong(){
          if(abort_other_json){abort_other_json.abort();}reset();timeList=[];previousTime=0;counter=0;
          clearInterval(stopTimer);
          index = (index+1)%songs.length;
          indexing = songs[index];
          $('#audioFile').attr('src',indexing.audio);
          loadSong(); 
      }
      function updateTimer(data){
          if(totalTime == 0){totalTime = parseInt((audio.duration * 1000));processing(data);}
          if (isNaN(totalTime)){
              totalTime = parseInt((audio.duration * 1000));
              // console.log("NAN TOTALTIME",totalTime);
              $('#totalTime').html(processTime(totalTime));
  
              // processing(data);
          };
          //for the end of the song
          if(time >= totalTime){if(play == 0) return; playSong(); if(songRepeat == 1){ reset(); playSong(); return; }else{ //nextSong(); playSong(); 
          } return;}
          if (time>=totalTime -8000){
            showEmail();
          }
          //update timer
          if(play == 1){time = time + 1000;}
          else if(play == -1){time = 0;}
          //upadate time on the progress bar
          if(audio.currentTime != previousTime){previousTime=audio.currentTime;$('#currentTime').html(processTime(time));var percent = time/totalTime * 100;$('#progress').css("width",percent+"%");}
          else{ time = parseInt(audio.currentTime*1000);if(time>100)time=time-100;if(play==1){audio.pause();if(audio.readyState == 4){audio.play();}} }
          safeKill = 0;
          while(true){
              safeKill += 1;
              if(safeKill >= 100) break;
              if(counter == 0){if(time < timeList[counter]){previous();break;}}
              if((counter == timeList.length) && (time <= timeList[counter-1])){counter--;previous();}
              if(time >= timeList[counter]){if(counter<=timeList.length){counter++;}next();}
              else if(time < timeList[counter-1]){counter--;previous();}
              else{if(play == 1 && !audio.paused && !audio.ended)centerize();break;}
          }
      }
      function loadSong(){
          $('#audioFile').attr('src',indexing.audio);
          abort_other_json = $.getJSON(indexing.json,function(data){
              processing(indexing);
              totalTime = NaN;
              stopTimer = setInterval(function(){updateTimer(data);},1000);
          });
      }
      loadSong();
      $('#prev').on('click',prevSong);
      $('#next').on('click',nextSong);
      $('#play').on('click',playSong);
      $('#repeat').on('click',toggleRepeat);
      $('#shuffle').on('click',toggleShuffle);
      function playSongAtIndex(data){
          if(data == index) return;
          if(index >= songs.length) return;
          if(abort_other_json){abort_other_json.abort();reset();clearInterval(stopTimer);timeList=[];previousTime=0;counter=0;}
          index = data;
          indexing = songs[index];
          $('#audioFile').attr('src',indexing.audio);
          loadSong();
      }
      function addToPlayList(data,index){
        // console.log("ADDING TO PLAYLIST",data,index);
          var html = "";html = $('#show-list').html();html +="<div class=\"float-song-card\" data-index=\""+index+"\"><img class=\"album-art\" src=\""+data.albumart+"\"><h4 class=\"song\">"+data.title+"</h4><h4 class=\"artist\">"+data.author+"</h4></div>";$('#show-list').html(html);$('.float-song-card').on('click',function(){  playSongAtIndex($(this).attr("data-index")); console.log("SCROLLLY");

          
          
          $('#playlist').css("transform","translateY(-120%)");togglePlaylist = 0;window.window.scrollTo(0, 0); window.scrollTo(0, window.scrollY - 30);
  
        });
      }
      function setPlaylist(){
          for(var i=0;i<songs.length;i++){
              $.getJSON(songs[i].json,function(i){addToPlayList(songs[i],i) }(i));
          }
      }
      setPlaylist();
  });
  $('#search').keyup(function(){
      var toSearch = $(this).val();
      $('.float-song-card').css("display","none");
      $('.float-song-card:contains('+toSearch+')').css("display","inline-block");
  });
  var togglePlaylist = 0;
  $('#back').on('click',function(){
    if(togglePlaylist == 0){
      $('#playlist').css("transform","translateY(3%)");
      togglePlaylist = 1;
    }
    else{
      $('#playlist').css("transform","translateY(-120%)");
      togglePlaylist = 0;
    }
  });
  
  
  }
  
// on click of the #find-user-button, expand the search bar to the left:
function searchUser(){
// get the value of the input of #find-user-button
var searchValue = $('#find-user-button input').val();
console.log(searchValue);
// if the value is empty, do nothing
if (searchValue === '') {
  return;
}
// if the value is not empty, go to url /music?email=searchValue
else {
  window.location.href = '/music?email=' + searchValue;
}
};

// If enter is pushed in #find-user-button, then run the searchUser function
$('#find-user-button').keypress(function(e){
if(e.which == 13){//Enter key pressed
  searchUser();
}
});


  
function showEmail(){

  // slide down animation with jquery the share-container class to be displayed:
  $(".share-container").slideDown(2000);
  // slide up animation with jquery the share-container class to be hidden:
  // document.getElementsByClassName("share-container")[0].style.display = "block";
}

  
codeLoaded = true;
}

loadCode(); // This will execute the code
