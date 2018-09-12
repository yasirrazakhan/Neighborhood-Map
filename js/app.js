/*Data Model*/

var locations = [
        {title:'Faisal Masjid', location:{lat:33.7295, lng:73.0376}},
        {title:'Monal Islamabad', location:{lat:33.7601, lng:73.0658}},
        {title:'Pakistan Mounument', location:{lat:33.6931, lng:73.0689}},
        {title:'F9 Park Islamabad', location:{lat:33.7017, lng:73.0228}},
        {title:'Blue Area', location:{lat:33.7173, lng:73.0708}}


];

var markers = [];

 var map;
 function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 33.6844, lng:73.0479},
          zoom: 12
        });

       for(var i=0; i<locations.length; i++){
       	var position = locations[i].location;
       	var title = locations[i].title;


      var marker = new google.maps.Marker({
      	position: position,
      	title:title,
      	map: map,
      	animation: google.maps.Animation.DROP,
      	id : i
      });
}
      markers.push(marker);
 }