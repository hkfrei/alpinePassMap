/*globals ko, google, Promise, componentHandler require */
require('material.min.js');
// get the polyfills for fetch and promises because they are not yet in all browsers
require('../../node_modules/whatwg-fetch/fetch.js');
import Promise from 'promise-polyfill';

// import neccessary model data and helper functions for the view
import mapStyle from './modules/mapStyle';
import appModel from './modules/model';
import mapView from './modules/mapView';

/*
@description Event listener when window object has finished loading.
At this time we can load the google map and do other init stuff.
*/
window.onload = function() {
    // check for network problems
    var snackbarContainer = document.getElementById('toast');
    window.addEventListener('online', function(){
        var data = {
            message: 'You\'re online again;-)'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    });
    window.addEventListener('offline', function(){
        var data = {
            message: 'You lost your Network connection.'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    });
    if (typeof window.google === 'undefined') {
        var message = 'It seems, there are some serious network problems. ';
        message += 'The App couldn\'t be loaded properly. ';
        message += 'We are very sorry an hope you try again later.';
        alert(message);
        return;
    }
    //activate the promise polyfill if necessary
    if (!window.Promise) {
        window.Promise = Promise;
    }
    //Do all the init work like adding all the markers and register event listeners
    viewModel.init();
};

/*
@description: the ViewModel used by knockout.js
*/
var ViewModel = function() {
    'use strict';

    /*
    @description getter for the google.maps.InfoWindow object.
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

    this.filter = ko.observable('');

    /*
    @description subscribe for changes in the filter property.
    This way we can update the markers on the map.
    */
    this.filter.subscribe(function() {
        this.displayMarkers(this.filterByTerm(this.filter()));
    }, this);

    /*
    @description array for all the google.maps.Marker objects on the map.
    this array is neccessary to hide the markers when they don't match the filter.
    */
    this.mapMarkers = [];

    /*
    @description array for all the list elements (filterable list on the left).
    */
    this.markers = ko.observableArray(appModel.getPasses().map(function(pass) {
        return new appModel.Pass(pass.id, pass.title, pass.location, pass.visible, pass.selected);
    }));

    /*
    @description filter the markers by a term and return an array with all the matches.
    @param {string} term the search term.
    @returns {array} array with all the markers where the marker name matches the filter
    */
    this.filterByTerm = function(term) {
        term = term.toLowerCase();
        return ko.utils.arrayFilter(this.markers(), function(marker) {
            if (marker.name.toLowerCase().lastIndexOf(term, 0) === 0) {
                return marker;
            }
        });
    };

    /*
    @description computed array with all the visible list elements.
    */
    this.filteredList = ko.computed(function() {
        var self = this;
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return self.markers();
        } else {
            return this.filterByTerm(filter);
        }
    }, this);

    /*
    @description computed array with all the selected list elements.
    */
    this.selectedMarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.filteredList(), function(element){
            return element.selected === true;
        });
    }, this);

    /*
    @description returns a map marker by id property.
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
        this.displayMarkers(this.markers());

        /*
        custom binding to prevent mdl switch class to not be applyed on update
        credit: https://stackoverflow.com/questions/44208015/how-to-bind-knockout-checkbox-to-a-material-design-lite
        */
        ko.bindingHandlers.updateSwitch = {
            init: function(element) {
                if(typeof(componentHandler) !== 'undefined') {
                    componentHandler.upgradeElement(element);
                }
            }
        };
    };

    /*
    @description display all the filtered markers on the map
    */
    this.displayMarkers = function(markers) {
        //when the select switch is clicked we dont't have an array as parameter.
        if(!Array.isArray(markers)) {
            markers = viewModel.filteredList();
            // because filteredList did not change when only the selected property of
            // one of it's children changed, we have to notify selectedMarkers manually
            viewModel.filteredList.notifySubscribers();
        }
        viewModel.removeMapMarkers();
        markers.forEach(function(marker) {
            var mapMarker = new google.maps.Marker({
                id: marker.id,
                position: marker.location,
                title: marker.name,
                icon: marker.selected ? appModel.highlightedMarkerIcon():appModel.defaultMarkerIcon(),
                map: viewModel.map
            });
            mapMarker.addListener('click', function() {
                appModel.currentMarker = this;
                viewModel.bounceOnce(this);
                viewModel.showInfoWindow();
            });
            mapMarker.addListener('mouseover', function() {
                /*
                check for internet connection, because we are loading
                the new marker image from remote.
                */
                if(window.navigator.onLine) {
                    this.setIcon(appModel.highlightedMarkerIcon());
                }
            });
            mapMarker.addListener('mouseout', function() {
                /*
                check for internet connection, because we are loading
                the new marker image from remote.
                */
                if(window.navigator.onLine) {
                    this.setIcon(appModel.defaultMarkerIcon());
                }
            });
            viewModel.mapMarkers.push(mapMarker);
        }, this);
        viewModel.panToMarkers(markers);
        //Very important for the click handler to work properly across browsers
        return true;
    };

    /*
    @description: make a marker bouncing, but only once.
    @Param {object} marker - a google.maps.Marker object.
    */
    this.bounceOnce = function(marker) {
        if(window.navigator.onLine) {
            marker.setIcon(appModel.highlightedMarkerIcon());
        }
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //Bouncing only once takes 700ms
        window.setTimeout(function(){
            marker.setAnimation(null);
            if(window.navigator.onLine) {
                marker.setIcon(appModel.defaultMarkerIcon());
            }
        },700);
    };

    /*
    @description If only one marker is visible, center the map on it
    otherwise set center an zoom to the initial values.
    */
    this.panToMarkers = function(markers) {
        if (markers.length === 0) {
            return;
        }
        if (markers.length > 1) {
            var bounds = new google.maps.LatLngBounds();
            markers.forEach(function(marker) {
                bounds.extend(marker.location);
            });
            this.map.fitBounds(bounds);
        } else {
            this.map.setCenter(markers[0].location);
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
        var mapMarker = viewModel.getMarkerById(listMarker.id);
        // if the clicked marker is equal to the current marker
        // only show iw when it's not visible.
        if (appModel.currentMarker && (mapMarker.id === appModel.currentMarker.id)) {
            if(viewModel.getInfoWindow().getMap() === null) {
                viewModel.map.panTo(mapMarker.position);
                viewModel.showInfoWindow();
            }
        } else {
            appModel.currentMarker = mapMarker;
            viewModel.map.panTo(appModel.currentMarker.position);
            viewModel.showInfoWindow();
        }
    };

    /*
    @description display the info window when a map marker gets clicked.
    */
    this.showInfoWindow = function() {
        var iw = viewModel.getInfoWindow();
        //check if there is allready an infoWindow instance available
        if (!iw) {
            iw = new google.maps.InfoWindow({maxWidth: 420});
            viewModel.setInfoWindow(iw);
        }
        if(iw) {
            iw.setMap(null);
        }
        viewModel.bounceOnce(appModel.currentMarker);
        window.setTimeout(function(){
            mapView.populateInfoWindow(appModel.currentMarker, iw);
        }, 750);
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
        return this.roundTrip() ? origin : this.selectedMarkers()[selectedMarkersLength - 1].location;
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
                response.push({location:this.selectedMarkers()[i].location, stopover:false});
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
        var selectedOrigin = this.selectedMarkers()[0].location;
        var selectedDestination  = this.getDestination(selectedOrigin);
        var selectedWaypoints = this.getWaypoints();
        var directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: selectedOrigin, //Ausgangspunkt
            destination: selectedDestination, //Ziel
            waypoints: selectedWaypoints,
            travelMode: 'BICYCLING'
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