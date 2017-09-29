/*globals ko, google, Promise, componentHandler */

/*
@description: Model Data
*/
var model = (function(){
    'use strict';
    // the greyscale style for the map
    var mapStyle = [
        {
            'featureType': 'administrative',
            'elementType': 'geometry',
            'stylers': [
                {
                    'color': '#a7a7a7'
                }
            ]
        },
        {
            'featureType': 'administrative',
            'elementType': 'labels.text.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#737373'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'on'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#efefef'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'labels',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#dadada'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'labels',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'labels.icon',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.attraction',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.attraction',
            'elementType': 'labels',
            'stylers': [
                {
                    'visibility': 'simplified'
                }
            ]
        },
        {
            'featureType': 'poi.attraction',
            'elementType': 'labels.text',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.park',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'off'
                },
                {
                    'saturation': '29'
                }
            ]
        },
        {
            'featureType': 'road',
            'elementType': 'labels.text.fill',
            'stylers': [
                {
                    'color': '#696969'
                }
            ]
        },
        {
            'featureType': 'road',
            'elementType': 'labels.icon',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'road.highway',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'color': '#ffffff'
                }
            ]
        },
        {
            'featureType': 'road.highway',
            'elementType': 'geometry.stroke',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#b3b3b3'
                }
            ]
        },
        {
            'featureType': 'road.arterial',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'color': '#ffffff'
                }
            ]
        },
        {
            'featureType': 'road.arterial',
            'elementType': 'geometry.stroke',
            'stylers': [
                {
                    'color': '#d6d6d6'
                }
            ]
        },
        {
            'featureType': 'road.local',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#ffffff'
                },
                {
                    'weight': 1.8
                }
            ]
        },
        {
            'featureType': 'road.local',
            'elementType': 'geometry.stroke',
            'stylers': [
                {
                    'color': '#d7d7d7'
                }
            ]
        },
        {
            'featureType': 'transit',
            'elementType': 'all',
            'stylers': [
                {
                    'color': '#808080'
                },
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'water',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'color': '#d3d3d3'
                }
            ]
        }
    ];
    // the pass Objects to create the list and the markers from.
    var passes = [
        {
            id: 1,
            title: 'Grimsel',
            location: {lat: 46.561779, lng: 8.344811},
            visible: true,
            selected: false
        },
        {
            id: 2,
            title: 'Furka',
            location: {lat:46.572160, lng: 8.414309},
            visible: true,
            selected: false
        },
        {
            id: 3,
            title: 'Oberalp',
            location: {lat: 46.659079, lng: 8.671124},
            visible: true,
            selected: false
        },
        {
            id: 4,
            title: 'Nufenen',
            location: {lat: 46.477448, lng: 8.386521},
            visible: true,
            selected: false
        },
        {
            id: 5,
            title: 'Lukmanier',
            location: {lat: 46.5640536347374, lng: 8.801765441894531},
            visible: true,
            selected: false
        },
        {
            id: 6,
            title: 'Susten',
            location: {lat: 46.729018, lng: 8.446040},
            visible: true,
            selected: false
        }
    ];

    // reference to the google.maps.Map object
    var map = null;

    // initial center coordinates of the map
    var INITIAL_CENTER = {lat:46.6203586, lng: 8.5441755};

    // initial zoom level of the map
    var INITIAL_ZOOM = 11;

    // represent a single pass
    var Pass = function(id, name, location, visibility, selected) {
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.location = ko.observable(location);
        this.visibility = ko.observable(visibility);
        this.selected = ko.observable(selected);
    };

    // default marker
    var defaultMarkerIcon = function() {
        return viewModel.makeMarkerIcon('7c4dff');
    };

    // highlighted marker
    var highlightedMarkerIcon = function() {
        return viewModel.makeMarkerIcon('cddc39');
    };

    /*
    @description: getter for the map style array
    */
    var getMapStyle = function() {
        return mapStyle;
    };

    /*
    @description: getter for the passes array
    */
    var getPasses = function() {
        return passes;
    };

    return {
        map: map,
        INITIAL_ZOOM: INITIAL_ZOOM,
        INITIAL_CENTER: INITIAL_CENTER,
        Pass: Pass,
        defaultMarkerIcon: defaultMarkerIcon,
        highlightedMarkerIcon: highlightedMarkerIcon,
        getMapStyle: getMapStyle,
        getPasses: getPasses
    };
})();

/*
@description: the ViewModel used by knockout.js
*/
var ViewModel = function() {
    'use strict';

    /*
    @description: getter for the google.maps.InfoWindow obect.
    @return: the info window object or null if it doesn't exist.
    */
    this.getInfoWindow = function() {
        return model.infoWindow || null;
    };

    /*
    @description: setter for the google.maps.InfoWindow obect in the model.
    */
    this.setInfoWindow = function(iwObject) {
        model.infoWindow = iwObject;
    };

    /*
    @description: array for all the google.maps.Marker objects on the map.
    this array is neccessary to hide the markers when they don't match the filter.
    */
    this.mapMarkers = [];

    /*
    @description: array for all the list marker objects on the map.
    */
    this.markers = ko.observableArray(model.getPasses().map(function(pass) {
        return new model.Pass(pass.id, pass.title, pass.location, pass.visible, pass.selected);
    }));

    /*
    @description: computed array with all the visible list markers.
    */
    this.filteredMarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.markers(), function(marker){
            return marker.visibility() === true;
        });
    }, this);

    /*
    @description: computed array with all the selected list markers.
    */
    this.selectedMarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.markers(), function(marker){
            return marker.selected() === true;
        });
    }, this);


    /*
    @description: returns a map marker by id.
    @Param {number} id - the id property of the marker who needs to be returned.
    */
    this.getMarkerById = function(id) {
        for (var i = 0; i < this.mapMarkers.length; i++) {
            var currentMarker = this.mapMarkers[i];
            if (currentMarker.id === id) {
                return currentMarker;
            }
        }
    };

    /*
    @description: initialize the filterable passlist and all
    the map markers. Add the neccessary Eevent listener to the filter input.
    @Param {object} map - The google.maps.Map object to display the markers on.
    */
    this.init = function(map) {
        model.map = map;
        model.map.addListener('click', function(e) {
            console.log(e.latLng.lat() + '/' + e.latLng.lng());
        });
        var filter = document.getElementById('pass-filter');
        filter.addEventListener('input', function(e){
            var searchString = e.target.value;
            this.filterMarkers(searchString.toLowerCase());
        }.bind(this));

        this.displayMarkers();
    };

    /*
    @description: this function takes in a color, and then creates a new marker
    icon of that color. The icon will be 21 px wide by 34 high, have an origin
    of 0, 0 and be anchored at 10, 34).
    */
    this.makeMarkerIcon = function (markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +'|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    },

    /*
    @description: display all the filtered markers on the map
    @Param {object} map - The google.maps.Map object to display the markers on.
    */
    this.displayMarkers = function() {
        var map = model.map;
        viewModel.removeMapMarkers();
        viewModel.filteredMarkers().forEach(function(marker) {
            var mapMarker = new google.maps.Marker({
                id: marker.id(),
                position: marker.location(),
                title: marker.name(),
                icon: marker.selected() ? model.highlightedMarkerIcon():model.defaultMarkerIcon(),
                map: map
            });
            mapMarker.addListener('click', function() {
                model.currentMarker = this;
                viewModel.bounceOnce(this);
                viewModel.showInfoWindow();
            });
            mapMarker.addListener('mouseover', function() {
                this.setIcon(model.highlightedMarkerIcon());
            });
            mapMarker.addListener('mouseout', function() {
                this.setIcon(model.defaultMarkerIcon());
            });
            viewModel.mapMarkers.push(mapMarker);
        }, this);
        viewModel.panToMarkers();
        //this makes sure the switch has the right design (maybe it's a bug in material design lite)
        componentHandler.upgradeDom();
    };

    /*
    @description: make a marker bouncing but only once.
    @Param {object} marker - a google.maps.Marker object.
    */
    this.bounceOnce = function(marker) {
        marker.setIcon(model.highlightedMarkerIcon());
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //Bounce only once
        window.setTimeout(function(){
            marker.setAnimation(null);
            marker.setIcon(model.defaultMarkerIcon());
        },700);
    };

    /*
    @description: If only one marker is visible, center the map on it
    otherwise set center an zoom to the initial values.
    */
    this.panToMarkers = function() {
        if (this.filteredMarkers().length === 1) {
            model.map.setZoom(14);
            if (model.map.getCenter() !== this.filteredMarkers()[0].location()) {
                model.map.panTo(this.filteredMarkers()[0].location());
            }
        } else {
            model.map.panTo(model.INITIAL_CENTER);
            model.map.setZoom(model.INITIAL_ZOOM);
        }
    };

    /*
    @description: filter the markers based on a search string from the input field.
    @Param {string} searchString - The string to filter the pass names against.
    */
    this.filterMarkers = function(searchString) {
        var noResults = document.getElementsByClassName('no-result-found')[0];
        noResults.style.display = 'none';
        this.markers().forEach(function(marker) {
            if (searchString.length === 0) {
                marker.visibility(true);
            } else {
                if (marker.name().toLowerCase().indexOf(searchString)) {
                    marker.visibility(false);
                } else {
                    marker.visibility(true);
                }
            }
        });
        if (this.filteredMarkers().length === 0) {
            noResults.style.display = 'block';
        }
        //display the info window if there is only one marker on the map.
        if (this.filteredMarkers().length === 1) {
            this.displayMarkers();
            this.bounceOnce(this.getMarkerById(this.filteredMarkers()[0].id()));
        } else {
            this.displayMarkers();
        }
    };

    /*
    @description: hides every marker on the map.
    */
    this.removeMapMarkers = function() {
        this.mapMarkers.forEach(function(marker){
            marker.setMap(null);
        });
        //empty the mapMarkers array
        this.mapMarkers = [];
    };

    this.showPass = function(listMarker) {
        var mapMarker = viewModel.getMarkerById(listMarker.id());
        // if the clicked marker is equal to the current marker
        // only show iw when it's not visible.
        if (model.currentMarker && (mapMarker.id === model.currentMarker.id)) {
            if(model.infoWindow.getMap() === null) {
                model.map.panTo(mapMarker.position);
                viewModel.showInfoWindow();
            }
        } else {
            model.currentMarker = mapMarker;
            model.map.panTo(model.currentMarker.position);
            viewModel.showInfoWindow();
        }
    };

    /*
    @description: show the right info window when a list item gets clicked
    @param {object} marker - the list marker object that got clicked. (not the map marker object).
    */
    this.showInfoWindow = function() {
        if(model.infoWindow) {
            model.infoWindow.setMap(null);
        }
        viewModel.bounceOnce(model.currentMarker);
        window.setTimeout(function(){
            mapView.populateInfoWindow(model.currentMarker);
        }, 750);
    };

    /*
    @description: search wikipedia articles for a given keyword.
    @param {string} searchstring - the keyword to search for in wikipedia.
    @return promise with the json response or an error message
    */
    this.getWikipediaArticle = function(searchstring) {
        return new Promise(function(resolve, reject) {
            fetch('https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search='+searchstring+'&limit=5')
                .then(function(resp) {
                    if (resp.ok) {
                        resolve(resp.json());
                    }
                    // if response not ok
                    reject('Network response was not ok.');
                })
                .catch(function(error) {
                    alert('error: ' + error.message);
                });
        });
    };

    /*
    @description: adds a street view panorama to the info window.
    @param {object} markter - the selected marker to add the info window to.
    */
    this.getStreetViewPanorama = function(marker) {
        //get streetView data
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        /* In case the status is OK, which means the pano was found,
        compute the position of the streetview image, then calculate
        the heading, then get a panorama from that and set the options.
        */
        function getStreetView(data, status){
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 20 //vertical angle
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
                // if status is not OK (failure)
                model.infoWindow.setContent('<h2>' + marker.title + '</h2><span>No Street View Found, Sorry</span>');
            }
        }
        /* Use streetview service to get the closest streetview image within
         50 meters of the markers position 
         */
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        model.infoWindow.open(model.map, marker);
    };

    this.getDestination = function(origin) {
        var selectedMarkersLength = this.selectedMarkers().length;
        if (this.selectedMarkers().length < 2) {
            this.roundTrip(false);
        }
        return this.roundTrip() ? origin : this.selectedMarkers()[selectedMarkersLength - 1].location();
    };

    this.getWaypoints = function() {
        var response = [];
        if (this.selectedMarkers().length > 2) {
            var waypointsCount = this.roundTrip() ? 1 : 2;
            for(var i = 1; i <= this.selectedMarkers().length - waypointsCount; i++) {
                response.push({location:this.selectedMarkers()[i].location(), stopover:false});
            }
        }
        return response;
    };

    // This function is in response to the user clicking the  "show optimized route" button
    // This will display the optimized cycling route between the selected passes on the map.
    this.displayDirections = function() {
        this.clearRoute();
        var selectedOrigin = this.selectedMarkers()[0].location();
        var selectedDestination  = this.getDestination(selectedOrigin);
        var selectedWaypoints = this.getWaypoints();
        var directionsService = new google.maps.DirectionsService;
        directionsService.route({
            origin: selectedOrigin, //Ausgangspunkt
            destination: selectedDestination, //Ziel
            waypoints: selectedWaypoints,
            travelMode: google.maps.TravelMode['BICYCLING']
        }, function(response, status){
            if (status === google.maps.DirectionsStatus.OK) {
                console.log(response);
                // Save some metadata about the route to display on screen
                viewModel.routeLength(response.routes[0].legs[0].distance.text);
                viewModel.routeDuration(response.routes[0].legs[0].duration.text);
                // Very nice -> DirectionsRenderer Class!!!
                viewModel.directionsDisplay.push(new google.maps.DirectionsRenderer({
                    map: model.map,
                    directions: response,
                    draggable: true,
                    polylineOptions: {
                        strokeColor: 'blue'
                    },
                    active: ko.observable(true)
                })
                );
            } else {
                window.alert('Directions request failed due to ' + status);
            }
            document.getElementsByClassName('route-details')[0].style.display = 'block';
        });
    };
    this.directionsDisplay = [];
    this.routeLength = ko.observable(0);
    this.routeDuration = ko.observable(0);
    this.roundTrip = ko.observable(false);

    this.clearRoute = function() {
        if (viewModel.directionsDisplay) {
            viewModel.directionsDisplay.forEach(function(route) {
                route.setMap(null);
            });
            viewModel.directionsDisplay = [];
            document.getElementsByClassName('route-details')[0].style.display = 'none';
        }
    };
};
// activate knockout 
var viewModel = new ViewModel();
ko.applyBindings(viewModel);


/*
@description: Functions to update view components like info windows etc.
*/
var mapView = (function(){
    'use strict';
    /*
    @description: Show the info window an populate it with content.
    @param {object} marker - the map marker object that got clicked.
    */
    var populateInfoWindow = function(marker) {
        var iw = viewModel.getInfoWindow();
        //check if there is allready an infoWindow instance available
        if (!iw) {
            iw = new google.maps.InfoWindow({maxWidth: 420});
            viewModel.setInfoWindow(iw);
        }
        //make sure the info window is not already opened on this marker
        if (iw.marker !== marker) {
            // clear iw content to give the streetview time to load.
            iw.setContent('');
            iw.marker = marker;
            // make sure the marker property is cleared if the infoWindow is closed
            iw.addListener('closeclick', function() {
                iw.marker = null;
            });

            //get wikipedia data
            viewModel.getWikipediaArticle(marker.title)
                .then(function(result) {
                    var name = result[0];
                    var description = result[2][0] || 'Sorry, no Wikipedia description available';
                    var link = result[3][0] || 'Sorry, no Wikipedia article available';
                    var iwCard = `<div class="mdl-card mdl-shadow--2dp">
                                  <div class="mdl-card__title mdl-card--border">
                                    <h2 class="mdl-card__title-text">${name}</h2>
                                  </div>
                                  <div class="mdl-card__media" id="pano">
                                  </div>
                                  <div class="mdl-card__supporting-text mdl-card--border">
                                   ${description}
                                  </div>
                                  <div class="mdl-card__actions">
                                    <a href="${link}" target="blank">More info...</a>
                                  </div>
                                </div>`;
                    //var currentIwContent = iw.getContent();
                    iw.setContent(iwCard);
                    //add streetView data to the Info Window
                    viewModel.getStreetViewPanorama(marker);
                });
        }
    };
    return {
        populateInfoWindow:populateInfoWindow
    };
})();



