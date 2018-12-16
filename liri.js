
var dotenv=require("dotenv").config();
var Spotify = require('node-spotify-api');
var fs=require('fs')
//var omdb = require('omdb');
var moment=require('moment')
var columnify = require('columnify')
var request = require("request");
const keys=require('./keys.js')
var spotify = new Spotify(keys.spotify);

var requestType=process.argv[2];
var nodeArgs = process.argv;
var requestName=""
var requestNameWord=[]

getTitle(nodeArgs)
makeRequest(requestType)


function makeRequest(requestType){
      switch (requestType) {
            case "concert-this":
              getConcert(requestName);
              break;
            case "spotify-this-song":
              getMusic(requestName);
              break; 
            case "movie-this":
              getMovie(requestName);
              break;
            case "do-what-it-says":
                readFromTheFile();
       }
   }
function getMovie(movieName){

     /*  * Title of the movie.
       * Year the movie came out.
       * IMDB Rating of the movie.
       * Rotten Tomatoes Rating of the movie.
       * Country where the movie was produced.
       * Language of the movie.
       * Plot of the movie.
       * Actors in the movie. */

  if(movieName.length===0){
    movieName="Mr. Nobody"
    }
// Then run a request to the OMDB API with the movie specified 
//&tomatoes=true&r=json
 var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&tomatoes=true&plot=short&apikey=trilogy";

 request(queryUrl, function(error, response, body) {
  
//   // If the request is successful
 if (!error && response.statusCode === 200) {
       var ratings=JSON.parse(response.body).Ratings
       var isRatedByTomatoes=false;
      // console.log(JSON.parse(response.body))
                                title= JSON.parse(response.body).Title;
                                year=JSON.parse(body).Year
                                imdbRating= JSON.parse(response.body).imdbRating
                                country=JSON.parse(response.body).Country
                                language=JSON.parse(response.body).Language
                                plot= JSON.parse(response.body).Plot
                                actors=JSON.parse(response.body).Actors
                                //there are some movies which are not rated by tomatoes
                                for(var i=0;i<ratings.length;i++){
                                    if(ratings[i].Source==='Rotten Tomatoes'){
                                        tomatoRating=ratings[i].Value;
                                        isRatedByTomatoes=true;                                  
                                      }
                                  }
                                  if(!isRatedByTomatoes){
                                    tomatoRating="N/A"
                                   }
   
                var output=columnify([
                                  {KEY:"Title of the movie",VALUE:title},
                                  {KEY:"Release Year",VALUE:year},
                                  {KEY:"IMDB Rating of the movie",VALUE:imdbRating},
                                  {KEY:"Rotten Tomatoes Rating",VALUE:tomatoRating},
                                  {KEY:"Country",VALUE:country},
                                  {KEY:"Language",VALUE:language},
                                  {KEY:"Plot",VALUE :plot},
                                  {KEY:"Actors",VALUE:actors}
                                      ],
                             {
                                minWidth: 30,
                                showHeaders: false,
                                columnSplitter: ' | ',
                                config: {
                                      VALUE: {maxWidth: 80}
                                  }                     
                       })
            saveToLogFile(requestType,requestNameWord,output)//write the output to log file 
           // saveToLogFile(br)
             console.log( "-----------------------------------------------------------------------------------------------------------------------" )
             console.log( "\n\t\t\t***LIRI MOVIE RESULT***" )
             console.log( "-----------------------------------------------------------------------------------------------------------------------" )
             console.log(output)
             console.log( "-----------------------------------------------------------------------------------------------------------------------" )       
 }
 
})
}

function getConcert(artistName){
  
  /*
   * Name of the venue
     * Venue location
     * Date of the Event (use moment to format this as "MM/DD/YYYY")
  */
var queryUrl = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp"

request(queryUrl, function(error, response, body) {
      var output=""
      // If the request is successful
      //console.log(JSON.parse(response.body))
      var data=JSON.parse(response.body);
      if (!error && response.statusCode === 200) {
              console.log( "\n\n\t\t***LIRI CONCERT RESULT***" )
              console.log( "--------------------------------------------------------------------" )
              for (var index = 0; index < data.length; index++) {
                          venueName = data[index].venue.name;
                          eventDate = data[index].datetime;
                          venueCity = data[index].venue.city;
                          venueCountry = data[index].venue.country;               
                          eventDateFormat = moment(eventDate).add(10, 'days').calendar();
                              
                                output={
                                      "Event Number":index+1,
                                      "Venue Name":venueName,
                                      "Venue Location":venueCity +" "+venueCountry,
                                      "Date Of The event":eventDateFormat
                                  }                          
                                  console.log(columnify(output, {minWidth: 25,showHeaders: false, columnSplitter: ' | '}))
                                  console.log( "--------------------------------------------------------------------" )
                                  var res=columnify(output, {minWidth: 25,showHeaders: false, columnSplitter: ' | '});
                                  saveToLogFile(requestType,requestNameWord,res)
                                }    
                                if(data.length===0)   {
                                  console.log(requestNameWord.join(' ').toUpperCase()+" "+"has No upcoming events")
                                  console.log( "--------------------------------------------------------------------" )

                                }                     
            }
          });
}

function getMusic(tileOfTheMusic){ 
/*
  * Artist(s)
     * The song's name
     * A preview link of the song from Spotify
     * The album that the song is from
   * If no song is provided then your program will default to "The Sign" by Ace of Base.*/

   if(tileOfTheMusic.length===0){
    tileOfTheMusic='The sign';
      requestNameWord.push(tileOfTheMusic);
   }

   spotify.search({ type:'track',query:tileOfTheMusic}, function(err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        } else {
     //console.log(data.tracks.items[0].album)
               output ={               
                      "Song Name ": requestNameWord.join(" ").toUpperCase(),
                      "Album Name" : data.tracks.items[0].album.name,
                      "Artist Name" : data.tracks.items[0].album.artists[0].name ,
                      "preview url:" :data.tracks.items[0].preview_url
                   }
                   var res=columnify(output, {minWidth: 25,showHeaders: false, columnSplitter: ' | '});
                   saveToLogFile(requestType,requestNameWord,res)

                   console.log( "-----------------------------------------------------------------------------------------------------------------------" )
                   console.log( "\n\t\t\t***LIRI SPOTIFY RESULT***" )
                   console.log( "-----------------------------------------------------------------------------------------------------------------------" )
                   console.log(columnify(output, {minWidth:17,showHeaders: false, columnSplitter: ' | '}))
                   console.log( "-----------------------------------------------------------------------------------------------------------------------" )                            
        }
});  
}

function readFromTheFile(){

  fs.readFile('random.txt', 'utf8', (error, data) => {
          const dataArray = data.split(',');     
          requestType=dataArray[0];
          requestNameWord=dataArray[1].split("")// techenique to remove the "" 
          requestName=requestNameWord.splice(1,requestNameWord.length-2).join("")    
          requestNameWord=[]  
          requestNameWord.push(requestName);
          makeRequest(requestType);
    });
}

function getTitle(nodeArgs){
  // Loop through all the words in the node argument
  // And do a little for-loop magic to handle the inclusion of "+"s
      for (var i = 3; i < nodeArgs.length; i++) {
            if (i > 3 && i < nodeArgs.length) {
              requestName= requestName+ "+" + nodeArgs[i];
              requestNameWord.push(nodeArgs[i])
            }
            else {
              requestName+= nodeArgs[i];
              requestNameWord.push(nodeArgs[i])
            }
    }

}
function saveToLogFile(requestType,requestNameWord,file){
  var name=requestNameWord.join(" ").toUpperCase();
  var br="-----------------------------------------------------------------------------------------------------------------"

fs.appendFile('log.txt',requestType+'\t'+name+'\n\n'+file+"\n"+br+"\n",function(err){       
  if(err){
  console.log("opps something went wrong")
  }
  else
 console.log("the file is updated")     
  })
}