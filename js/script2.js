// model
var locations = [
        {
          latLng: {lat: 43.648516, lng: -79.396062},
          name:'Alo Restaurant',
          desc:'Bars, French',
          id: 0
        },
        {
          latLng: {lat: 43.659299, lng: -79.382144},
          name: 'Banh Mi Boys',
          desc: 'vietnamese, Asian Fusion'
        },
        {
          latLng: {lat: 43.657345, lng: -79.384107},
          name: 'The Elm Tree Restaurant',
          desc: 'Mediterranean, Modern European'
        },
        {
          latLng: {lat: 43.654921, lng: -79.384992},
          name: 'Poke Guys',
          desc: 'Fast Food, Hawaiian'
        },
        {
          latLng: {lat: 43.667504, lng: -79.369292},
          name: 'Under The Table Restaurant',
          desc: 'Caribbean, Comfort Food, Breakfast & Brunch'
        }
    ];

var Location = function Location(location, map) {

    this.latLng = ko.observable(location.latLng);
    this.name = ko.observable(location.name);
    this.desc = ko.observable(location.desc);
    this.id = ko.observable(location.id);

    var marker;

    // default marker colour
    var defaultIcon = makeMarkerIcon('0091ff');
    // highlight marker colour
    var highlightedIcon = makeMarkerIcon('FFFF24');
    // INFO window
    var largeInfowindow = new google.maps.InfoWindow();

    marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.latLng()),
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        name:this.name(),
        desc:this.desc(),
        latLng:this.latLng()
    });

    // assign current marker to location object
    this.marker = marker;

    marker.addListener('click', function() {
      var self = this;
      populateInfoWindow(self, largeInfowindow);
      self.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){ self.setAnimation(null); }, 1450);
    });

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });

    this.isVisible = ko.observable(false);

    this.isVisible.subscribe(function(currentState) {
        if (currentState) {
          marker.setMap(map);
        } else {
          marker.setMap(null);
        }
    });

    this.isVisible(true);
}


// controller
var viewModel = function(map){
    var self = this;

    self.map = map;

    self.locationList = ko.observableArray();
    self.filter = ko.observable('');



    locations.forEach(function(location){
        self.locationList.push( new Location(location, self.map));     
    })


    for(var i =0; i < self.locationList().length; i++){
      var request = getYelpInfo(self.locationList()[i]);
      console.log(request);
    }



    // filters the list view
    self.filteredItems = ko.computed(function () {
        var filter = self.filter().toLowerCase();

        return ko.utils.arrayFilter(self.locationList(), function (location) {
            var doesMatch = location.name().toLowerCase().indexOf(filter) >= 0;

            location.isVisible(doesMatch);

            return doesMatch;
        });
    });

    self.openInfowindow = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    }


}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + '<b>' +marker.name + '</b>' + "<br>"+ marker.desc + '</div>');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
}



// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
    return markerImage;
}





function initMap() {
    var googleMap = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 43.6532, lng: -79.3832},
      zoom: 14
    });

    ko.applyBindings(new viewModel(googleMap));

    
}

/**
* @description Generate random number for Yelp request.
**/
function generateNonce() {
  return (Math.floor(Math.random() * 1e12).toString());
}

/**
* @description Function creates a Yelp API request.
* @param {Object} restaurant 
* @param {handleYelpResults} callback - Handles the successful Yelp request results.
* @returns {object} - Yelp request setting for the respective restaurant.
**/
function getYelpInfo(target){

// var YELP_BASE_URL = ''+ target.web +''
//   ,YELP_CONSUMER_KEY = '6CE4_UfXfQm9XiVp7ftIFg'
//   ,YELP_TOKEN = 'Zr467MTZq9IT7yQRzv2bOvz6A-aXdcT8'
//   ,YELP_CONSUMER_SECRET = 'zXvnC2ra4YPE_5KVOMalesiignU' 
//   ,YELP_TOKEN_SECRET = '  Xw9V5sD5em4ulqeOvCTBUsLxoqI';

var YELP_BASE_URL = ''+ target.name() +'';
var YELP_KEY = "6CE4_UfXfQm9XiVp7ftIFg",
    YELP_TOKEN = "Zr467MTZq9IT7yQRzv2bOvz6A-aXdcT8",
    YELP_KEY_SECRET = "zXvnC2ra4YPE_5KVOMalesiignU",
    YELP_TOKEN_SECRET = "Xw9V5sD5em4ulqeOvCTBUsLxoqI";
  

var yelpURL = YELP_BASE_URL;

var parameters = {
  oauth_consumer_key: YELP_KEY,
  oauth_token: YELP_TOKEN,
  oauth_nonce: generateNonce(),
  oauth_timestamp: Math.floor(Date.now()/1000),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_version : '1.0',
  callback: 'cb',
  location: yelpURL                   
  };
  
  

var encodedSignature = oauthSignature.generate('GET',yelpURL, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
parameters.oauth_signature = encodedSignature;

var settings = {
    url: yelpURL,
    data: parameters,
    cache: true,            
    dataType: 'jsonp',
    //success: function(results) {
    success: function(results) {
    //callback(results, target);
        return results;
    },
    fail: function() {
    }
    
  };
 
    return settings;
  
}