/*Data Model*/
//locations that will be show on the map
var locations = [{
        title: 'Faisal Masjid',
        location: {
            lat: 33.7295,
            lng: 73.0376
        }
    },
    {
        title: 'Islamabad International Airport',
        location: {
            lat: 33.5566,
            lng: 72.8344
        }
    },
    {
        title: 'Pakistan Mounument',
        location: {
            lat: 33.6931,
            lng: 73.0689
        }
    },
    {
        title: 'Fatima Jinnah Park',
        location: {
            lat: 33.7017,
            lng: 73.0228
        }
    },
    {
        title: 'NUST Islamabad',
        location: {
            lat: 33.6426,
            lng: 72.9929
        }
    }


];

var markers = [];
var largeInfowindow;
var bounds;
var map;

//this call back method will be run as soon as we get response from API
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.6844,
            lng: 73.0479
        },
        zoom: 12
    });
    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel());
}

//this funciton creates individual location and markers
var Location = function(data) {

    var self = this;
    this.title = data.title;
    this.position = data.location;
    this.street = '';
    this.city = '';
    this.shouldShowMessage = ko.observable(true);

    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        map: map,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
    });

    bounds.extend(self.marker.position);
    map.fitBounds(bounds);

    this.popUpMarker = function(self) {
        google.maps.event.trigger(self.marker, 'click');
    }

    this.marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow, self.street, self.city);
        toggleBounce(this);
    });

    this.filterMarkers = ko.computed(function() {
        if (self.shouldShowMessage() === true) {
            self.marker.setMap(map)
        } else {
            self.marker.setMap(null);
        }
    });

    var defaultIcon = makeMarkerIcon('0091ff');

    var highlightedIcon = makeMarkerIcon('FFFF24');

    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });



    var Client_ID = 'O3MIHNCL5B0BIGZMOOJPZOT3STLKE1GTIUH0CIDRYJUMK045';
    var Client_Secret = 'WURQAL0I5M0UGYODO1J5FNOID004LE5M0W1C3JJEC5IF5JK3';

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + Client_ID + '&client_secret=' + Client_Secret + '&v=20160118' + '&query=' + this.title;
    $.getJSON(foursquareURL,
    function(data) {
        var venues = data.response.venues[0];
        if (venues.location.formattedAddress[0]){
          self.street = venues.location.formattedAddress[0];
        }
        if (venues.location.formattedAddress[1]) {
           self.city = venues.location.formattedAddress[1];
        }

      }).fail(function() {
        alert('Error Ocurred');
    });

};


//this function binds data to the view
function ViewModel() {

    var self = this;
    this.locList = ko.observableArray([]);
    this.query = ko.observable('');


    locations.forEach(function(item) {
        self.locList.push(new Location(item));
    });

    //this funciton filter location based on search refrenced from stackoverflow.
    this.filterPlaces = ko.computed(function() {
        var search = self.query().toLowerCase();
        if (!search) {
            return self.locList();
        }
        return self.locList().filter(function(data) {
            var result = data.title.toLowerCase().indexOf(search) > -1;
            data.shouldShowMessage(result);
            return result;
        });

        self.locList().forEach(function(data) {
            data.shouldShowMessage(true);
        })
        return self.locList();
    }, self);


}
//this function handels google map Api errors
function googleError(){
  alert('Could not fetch data');
}

//function to create infowindow and data associated with it code refrenced from udacity course.
function populateInfoWindow(marker, infowindow, street, city) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker = null;
        });

        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        var infoContent = '<h4>' + marker.title + '</h4>' +
            '<p>' + street + "<br>" + city + "</p>";

        //create a streetview image code refrenced from udacity course
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent(infoContent + '<div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(infoContent +
                    '<div>No Street View Found</div>');
            }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

//create a colored marker code refrenced from udacity.
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

//animate marker code refrenced from udacity course
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 500);
    }
}



var menu = document.getElementById('nav');
var main = document.querySelector('#map');
var drawer = document.querySelector('.container');

//add listener for hamburger icon
menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
});
main.addEventListener('click', function() {
    drawer.classList.remove('open');
});