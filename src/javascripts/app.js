/*globals ko, google, Promise, componentHandler require */
require('material.min.js');
// Get the polyfills for fetch and promises because they are not yet in all browsers
require('../../node_modules/promise-polyfill/promise.min.js');
require('../../node_modules/whatwg-fetch/fetch.js');
import mapStyle from './modules/mapStyle';
import appModel from './modules/model';

/*
@description Event listener when window object has finished loading.
At this time we can load the google map and do other init stuff.
*/
window.onload = function() {
    //Do all the init work like adding all the markers and register event listeners
    viewModel.init();
};

/*
@description: the ViewModel used by knockout.js
*/
var ViewModel = function() {
    'use strict';

    /*
    @description getter for the google.maps.InfoWindow obect.
    @returns The info window object or null if it doesn't exist.
    */
    this.getInfoWindow = function() {
        return this.infoWindow || null;
    };

    /*
    @description setter for the google.maps.InfoWindow obect in the model.
    @param {object} a google.maps.InfoWindow object.
    */
    this.setInfoWindow = function(iwObject) {
        this.infoWindow = iwObject;
    };

    /*
    @description: array for all the google.maps.Marker objects on the map.
    this array is neccessary to hide the markers when they don't match the filter.
    */
    this.mapMarkers = [];

    /*
    @description array for all the list marker objects on the map.
    */
    this.markers = ko.observableArray(appModel.getPasses().map(function(pass) {
        return new appModel.Pass(pass.id, pass.title, pass.location, pass.visible, pass.selected);
    }));

    /*
    @description computed array with all the visible list markers.
    */
    this.filteredMarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.markers(), function(marker){
            return marker.visibility() === true;
        });
    }, this);

    /*
    @description computed array with all the selected list markers.
    */
    this.selectedMarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.markers(), function(marker){
            return marker.selected() === true;
        });
    }, this);

    /*
    @description returns a map marker by id.
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
    @description initialize the map, the filterable passlist and all
    the map markers. Add the neccessary Event listener to the filter input.
    */
    this.init = function() {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 11,
            center: appModel.INITIAL_CENTER,
            fullscreenControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            styles: mapStyle
        });
        this.map = map;
        var filter = document.getElementById('pass-filter');
        filter.addEventListener('input', function(e){
            var searchString = e.target.value;
            this.filterMarkers(searchString.toLowerCase());
        }.bind(this));

        this.displayMarkers();
    };

    /*
    @description display all the filtered markers on the map
    */
    this.displayMarkers = function() {
        viewModel.removeMapMarkers();
        viewModel.filteredMarkers().forEach(function(marker) {
            var mapMarker = new google.maps.Marker({
                id: marker.id(),
                position: marker.location(),
                title: marker.name(),
                icon: marker.selected() ? appModel.highlightedMarkerIcon():appModel.defaultMarkerIcon(),
                map: viewModel.map
            });
            mapMarker.addListener('click', function() {
                appModel.currentMarker = this;
                viewModel.bounceOnce(this);
                viewModel.showInfoWindow();
            });
            mapMarker.addListener('mouseover', function() {
                this.setIcon(appModel.highlightedMarkerIcon());
            });
            mapMarker.addListener('mouseout', function() {
                this.setIcon(appModel.defaultMarkerIcon());
            });
            viewModel.mapMarkers.push(mapMarker);
        }, this);
        viewModel.panToMarkers();
        //this makes sure the roundtrip switch has the right design (maybe it's a bug in material design lite)
        componentHandler.upgradeDom();
    };

    /*
    @description: make a marker bouncing, but only once.
    @Param {object} marker - a google.maps.Marker object.
    */
    this.bounceOnce = function(marker) {
        marker.setIcon(appModel.highlightedMarkerIcon());
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //Bouncing only once takes 700ms
        window.setTimeout(function(){
            marker.setAnimation(null);
            marker.setIcon(appModel.defaultMarkerIcon());
        },700);
    };

    /*
    @description If only one marker is visible, center the map on it
    otherwise set center an zoom to the initial values.
    */
    this.panToMarkers = function() {
        if (this.filteredMarkers().length === 1) {
            this.map.setZoom(14);
            if (this.map.getCenter() !== this.filteredMarkers()[0].location()) {
                this.map.panTo(this.filteredMarkers()[0].location());
            }
        } else {
            this.map.panTo(appModel.INITIAL_CENTER);
            this.map.setZoom(appModel.INITIAL_ZOOM);
        }
    };

    /*
    @description filter the markers based on a search string from the input field.
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
    @description hides every marker on the map.
    */
    this.removeMapMarkers = function() {
        this.mapMarkers.forEach(function(marker){
            marker.setMap(null);
        });
        //empty the mapMarkers array
        this.mapMarkers = [];
    };

    /*
    @description Displays an info window when a list element on the left get's clicked.
    @param {object} listMarker - the list marker object that got clicked. (not the map marker object).
    */
    this.showPass = function(listMarker) {
        var mapMarker = viewModel.getMarkerById(listMarker.id());
        // if the clicked marker is equal to the current marker
        // only show iw when it's not visible.
        if (appModel.currentMarker && (mapMarker.id === appModel.currentMarker.id)) {
            if(viewModel.getInfoWindow().getMap() === null) {
                this.map.panTo(mapMarker.position);
                viewModel.showInfoWindow();
            }
        } else {
            appModel.currentMarker = mapMarker;
            viewModel.map.panTo(appModel.currentMarker.position);
            viewModel.showInfoWindow();
        }
    };

    /*
    @description show the right info window when a list item gets clicked
    */
    this.showInfoWindow = function() {
        var iw = viewModel.getInfoWindow();
        if(iw) {
            iw.setMap(null);
        }
        viewModel.bounceOnce(appModel.currentMarker);
        window.setTimeout(function(){
            viewModel.populateInfoWindow(appModel.currentMarker);
        }, 750);
    };

    /*
    @description search wikipedia articles for a given keyword.
    @param {string} searchstring - the keyword to search for in wikipedia.
    @returns promise with the json response or an error message
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
    @description adds a street view panorama to the info window.
    @param {object} markter - the selected marker to add the info window to.
    */
    this.getStreetViewPanorama = function(marker) {
        //get streetView data
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        var iw = viewModel.getInfoWindow();

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
                new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
                // if status is not OK (failure)
                var streetViewFailureContent = iw.getContent();
                // remove the id=pano. No street view should be displayed
                streetViewFailureContent = streetViewFailureContent.replace(' id="pano"','');
                streetViewFailureContent += '<h6>No Street View Found, Sorry...</h6>';
                iw.setContent(streetViewFailureContent);
            }
        }
        /* 
        Use streetview service to get the closest streetview image within
        50 meters of the markers position 
        */
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        iw.open(this.map, marker);
    };

    /*
    @description Show the info window an populate it with wikipedia and streetview content.
    @param {object} marker - the map marker object that got clicked.
    */
    this.populateInfoWindow = function(marker) {
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
                    iw.setContent(iwCard);
                    //add streetView data to the Info Window
                    viewModel.getStreetViewPanorama(marker);
                });
        }
    };

    /*
    @description Calculate the destination lat/lng accrding to roundtrip boolean.
    @returns {object} The lat/lng if the destination.
    */
    this.getDestination = function(origin) {
        var selectedMarkersLength = this.selectedMarkers().length;
        if (this.selectedMarkers().length < 3) {
            this.roundTrip(false);
        }
        return this.roundTrip() ? origin : this.selectedMarkers()[selectedMarkersLength - 1].location();
    };

    /*
    @description Calculate the waypoints due to the selected markers.
    @returns {array} All the waypoints as objects with a location and stopover property.
    */
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

    /*
    @description This function is in response to the user clicking the  "show optimized route" button
    This will display the optimized cycling route between the selected passes on the map.
    */
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
                // Save some metadata about the route to display on screen
                viewModel.startAddress(response.routes[0].legs[0].start_address);
                viewModel.endAddress(response.routes[0].legs[0].end_address);
                viewModel.routeLength(response.routes[0].legs[0].distance.text);
                viewModel.routeDuration(response.routes[0].legs[0].duration.text);
                // Very nice -> DirectionsRenderer Class!!!
                viewModel.directionsDisplays.push(new google.maps.DirectionsRenderer({
                    map: viewModel.map,
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

    /*
    @description Array of direction Display Objects.
    */
    this.directionsDisplays = [];

    /*
    @description The start address of the route.
    */
    this.startAddress = ko.observable(0);

    /*
    @description The end address of the route.
    */
    this.endAddress = ko.observable(0);

    /*
    @description The length in km of the cycling tour.
    */
    this.routeLength = ko.observable(0);

    /*
    @description The time the cycling tour takes.
    */
    this.routeDuration = ko.observable(0);

    /*
    @description Boolean if bike route has to be calculated as roundtrip.
    */
    this.roundTrip = ko.observable(false);

    /*
    @description Remove all cycling routes from the map.
    */
    this.clearRoute = function() {
        if (viewModel.directionsDisplays) {
            viewModel.directionsDisplays.forEach(function(route) {
                route.setMap(null);
            });
            viewModel.directionsDisplays = [];
            document.getElementsByClassName('route-details')[0].style.display = 'none';
        }
    };
};
// activate knockout 
var viewModel = new ViewModel();
ko.applyBindings(viewModel);