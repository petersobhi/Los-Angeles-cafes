var map;

var places = [{id: 0, title: "Porto's Bakery & Cafe", position: {lat: 34.1504164, lng: -118.255506}},
              {id: 1, title: "The Griddle Cafe", position: {lat: 34.097799, lng: -118.362253}},
              {id: 2, title: "Pitchoun!", position: {lat: 34.0485765, lng: -118.254111}},
              {id: 3, title: "The Cow's End Cafe", position: {lat: 33.9794187, lng: -118.4657689}},
              {id: 4, title: "Aroma Cafe", position: {lat: 34.1494302, lng: -118.378727}},
              {id: 5, title: "Urth Caffe", position: {lat: 34.0419835, lng: -118.235429}},
              {id: 6, title: "The Trails Cafe", position: {lat: 34.1139438, lng: -118.3079227}},];


var viewModel = function(){
  var self = this;

  // places before filtering
  self.observablePlaces = ko.observableArray(places);

  self.searchQuery = ko.observable('');

  // places after filtering
  self.filteredPlaces = ko.computed(function() {
    var filter = self.searchQuery().toLowerCase();

    if (!filter) {
      markers.forEach(function(marker){
        marker.setVisible(true);
      });
      return self.observablePlaces();
    } else {
      return ko.utils.arrayFilter(self.observablePlaces(), function(place) {
        if (place.title.toLowerCase().indexOf(filter) !== 0){
          markers[place.id].setVisible(false);

          //close info window if its place is not in the filtered list
          if(markers[place.id] == infoWindow.marker){
            infoWindow.close();
          }
          return false;
        }
        markers[place.id].setVisible(true);
        return true;
      });
    }
  });
};

var infoWindow;
var markers = [];

// add click listener for a marker to open infowindow
function markerListener(marker){
  marker.addListener('click', function() {
      populateInfoWindow(this);
    });
}

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 34.0838103, lng: -118.350534},
  zoom: 15
  });



  infoWindow = new google.maps.InfoWindow();

  var bounds = new google.maps.LatLngBounds();

  for(var i=0; i<places.length; i++){
      var marker = new google.maps.Marker({
        position: places[i].position,
        map: map,
        title: places[i].title,
        animation: google.maps.Animation.DROP,
        id: places[i].id,
      });

      markers.push(marker);

      markerListener(marker);

      bounds.extend(marker.position);

  }

  map.fitBounds(bounds);


   myMarker.addListener('click', function(){
    infoWindow.open(map, myMarker);
   });
 }

function populateInfoWindow(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){ marker.setAnimation(null); }, 1500);

  if (infoWindow.marker != marker) {
    map.panTo(marker.getPosition());
    infoWindow.marker = marker;
    infoWindow.setContent('Loading...');

  var fs_client_id = 'W4RQA3UHTX2EFLKW0V0TCFL1NGKXY5PLTSSA5BI2UDSBJG3Z';
  var fs_client_secret = 'M3CCTQI1GQVGFYE3MJH4UHXF2BE4TGKUGXRUZKGAKCAP1LI5';

  var fs_URL = 'https://api.foursquare.com/v2/venues/search?ll='+ marker.getPosition().lat() + ',' +
                marker.getPosition().lng() + '&client_id=' + fs_client_id +
               '&client_secret=' + fs_client_secret + '&v=20160118'+
               '&query='+marker.title;

  var google_api_key = 'AIzaSyDISKH8FFEGapWMOGnOAaiJ-IyqvhXcOao';

  var image_url = 'https://maps.googleapis.com/maps/api/streetview?size=400x200&location=' + 
                   marker.getPosition().lat() +','+marker.getPosition().lng()+
                  '&heading=100&pitch=12&scale=2&key=' + google_api_key;
                 
  $.getJSON(fs_URL).done(function(data){
    var foursquareData = new FoursquareData(data.response.venues[0]);
    var infoWindowHTML = '<h3>'+marker.title+'</h3> <p>'+ foursquareData.address +'</p> <p>website: '+ 
                          foursquareData.website +'</p> <p>phone: '+ foursquareData.phone +'</p>' +
                          '<img src="'+ image_url +'" alt="street image">';
    infoWindow.setContent(infoWindowHTML);
  }).fail(function(){
    alert('Error in getting data for this place');
  });

  }

  infoWindow.open(map, marker);
    infoWindow.addListener('closeclick',function(){
      infoWindow.setMarker = null;
    });
}

function populateInfoWindowById(id) {
  populateInfoWindow(markers[id]);
}

function FoursquareData(venue){
  this.phone = venue.contact.formattedPhone;
  this.website = venue.url;
  this.address = venue.location.formattedAddress.join();
}

function start(){
  ko.applyBindings(new viewModel());
  initMap();
}

function mapError(){
  alert('Error in loading the map');
}
